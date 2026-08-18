import httpx

from fastapi import HTTPException

from app.core.config import settings
from app.services.nim_service import evaluate_issues


GITHUB_API_URL = "https://api.github.com/search/issues"

# Keep NIM usage controlled.
NIM_CANDIDATE_LIMIT = 15
GITHUB_PAGE_SIZE = 30


def is_low_value_issue(item: dict) -> bool:
    """
    Remove issues that are clearly poor contribution candidates.

    This is deterministic filtering.
    It does NOT decide whether an issue is relevant to the user.
    """

    title = (
        item.get("title") or ""
    ).lower()

    body = (
        item.get("body") or ""
    ).lower()

    labels = {
        (label.get("name") or "").lower()
        for label in item.get("labels", [])
    }

    text = f"{title} {body} {' '.join(labels)}"

    # ---------------------------------------------------------
    # Obvious automation / dependency noise
    # ---------------------------------------------------------

    blocked_terms = [
        "dependency dashboard",
        "renovate",
        "dependabot",
        "[ci]",
        "ci failure",
        "ci-test-failure",
        "automated test failure",
        "automated dependency",
        "dependency vulnerability",
        "security vulnerability",
    ]

    if any(term in text for term in blocked_terms):
        return True

    # ---------------------------------------------------------
    # Security / CVE issues are not contribution targets
    # for our beginner-oriented matching system.
    # ---------------------------------------------------------

    security_labels = {
        "security",
        "vulnerability",
        "cve",
        "mend",
    }

    if labels.intersection(security_labels):
        return True

    # ---------------------------------------------------------
    # Issues that are primarily research/performance work.
    #
    # We don't reject every performance issue globally,
    # but obvious benchmark/research tasks are poor beginner
    # candidates.
    # ---------------------------------------------------------

    research_labels = {
        "wayfinder:research",
        "research",
    }

    if labels.intersection(research_labels):
        return True

    performance_labels = {
        "performance",
        "benchmark",
        "benchmarks",
    }

    if labels.intersection(performance_labels):
        return True

    return False


def get_issue_score(item: dict) -> int:
    """
    Rank candidates for NIM.

    This is NOT the final MergeMate relevance score.

    It only determines which real GitHub issues deserve
    our limited NIM evaluation budget.
    """

    labels = {
        (label.get("name") or "").lower()
        for label in item.get("labels", [])
    }

    title = (
        item.get("title") or ""
    ).lower()

    body = (
        item.get("body") or ""
    ).lower()

    score = 0

    # ---------------------------------------------------------
    # Strong contribution signals
    # ---------------------------------------------------------

    if "good first issue" in labels:
        score += 40

    if "help wanted" in labels:
        score += 30

    if "beginner" in labels:
        score += 25

    # ---------------------------------------------------------
    # Useful issue types
    # ---------------------------------------------------------

    if "documentation" in labels:
        score += 15

    if "tests" in labels or "testing" in labels:
        score += 10

    if "bug" in labels:
        score += 8

    if "enhancement" in labels:
        score += 5

    # ---------------------------------------------------------
    # Evidence that the issue is actually actionable
    # ---------------------------------------------------------

    if body.strip():
        score += 5

    guidance_terms = [
        "acceptance criteria",
        "what to build",
        "where to look",
        "implementation",
        "steps to reproduce",
        "expected behavior",
        "how to reproduce",
    ]

    for term in guidance_terms:
        if term in body:
            score += 3

    # ---------------------------------------------------------
    # Small-scope language is useful.
    #
    # This is only a priority boost, NOT a final decision.
    # NIM still determines actual scope.
    # ---------------------------------------------------------

    small_scope_terms = [
        "small change",
        "small fix",
        "simple fix",
        "add a test",
        "add tests",
        "documentation",
        "error message",
        "cli",
        "command line",
    ]

    for term in small_scope_terms:
        if term in title or term in body:
            score += 4

    return score


def normalize_issue(item: dict) -> dict:
    """
    Convert GitHub's response into MergeMate's internal issue format.
    """

    repository_url = item.get(
        "repository_url",
        "",
    )

    repository = (
        repository_url
        .rstrip("/")
        .split("/repos/")[-1]
    )

    return {
        "id": item["id"],
        "repository": repository,
        "title": item["title"],
        "description": item.get("body") or "",
        "url": item["html_url"],
        "labels": [
            label["name"]
            for label in item.get(
                "labels",
                [],
            )
        ],
        "state": item["state"],
        "updated_at": item["updated_at"],
    }


async def _search_github(
    query: str,
    headers: dict,
) -> list[dict]:
    """
    Execute one GitHub issue search.
    """

    params = {
        "q": query,
        "sort": "updated",
        "order": "desc",
        "per_page": GITHUB_PAGE_SIZE,
    }

    try:

        async with httpx.AsyncClient(
            timeout=15.0
        ) as client:

            response = await client.get(
                GITHUB_API_URL,
                headers=headers,
                params=params,
            )

    except httpx.RequestError as error:

        raise HTTPException(
            status_code=502,
            detail="Unable to connect to GitHub.",
        ) from error

    if response.status_code != 200:

        print(
            "GITHUB ERROR:",
            response.status_code,
            response.text[:1000],
        )

        raise HTTPException(
            status_code=502,
            detail="GitHub issue search failed.",
        )

    data = response.json()

    return data.get(
        "items",
        [],
    )


async def search_github_issues(
    focus_skill: str,
    known_skills: list[str] | None = None,
    experience: str = "",
    contributions: str = "",
    target_role: str = "",
    search_query: str = "",
) -> dict:
    """
    Build a high-quality GitHub candidate pool.

    ARCHITECTURE:

        GitHub
          ↓
        Candidate retrieval
          ↓
        Deterministic cleanup
          ↓
        Candidate ranking
          ↓
        NIM
          ↓
        Personalized recommendation

    IMPORTANT:

    known_skills are NOT inserted into the GitHub query.

    Focus skill:
        Search direction.

    Broader stack:
        Compatibility context for NIM.

    We do NOT require an issue to use the user's entire stack.
    """

    known_skills = known_skills or []

    # =========================================================
    # GITHUB API
    # =========================================================

    # MergeMate only searches publicly available GitHub issues.
    # We intentionally do not send a personal GitHub token here.
    # This avoids authentication failures and is sufficient for
    # the MVP's public issue search.

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    # =========================================================
    # SEARCH BASE
    # =========================================================
    #
    # IMPORTANT:
    #
    # Search specifically in title/body.
    #
    # This reduces noise from issues that only mention PyTorch
    # in environment information, metadata, etc.
    # =========================================================

    base_query_parts = [
        f'"{focus_skill}" in:title,body',
        "is:issue",
        "is:open",
    ]

    if search_query.strip():
        base_query_parts.append(
            search_query.strip()
        )

    base_query = " ".join(
        base_query_parts
    )

    # =========================================================
    # SEARCH STRATEGY
    # =========================================================
    #
    # We intentionally use multiple searches:
    #
    # 1. Good first issues
    # 2. Help wanted
    # 3. Documentation
    # 4. General focus-skill issues as fallback
    #
    # Then we merge and deduplicate them.
    # =========================================================

    queries = [
        (
            "good_first_issue",
            f'{base_query} label:"good first issue"',
        ),
        (
            "help_wanted",
            f'{base_query} label:"help wanted"',
        ),
        (
            "documentation",
            f'{base_query} label:documentation',
        ),
    ]

    raw_results: dict[str, list[dict]] = {}

    for name, query in queries:

        raw_results[name] = await _search_github(
            query=query,
            headers=headers,
        )

    # =========================================================
    # MERGE + DEDUPLICATE
    # =========================================================

    unique_issues: dict[int, dict] = {}

    for results in raw_results.values():

        for item in results:

            issue_id = item.get("id")

            if not issue_id:
                continue

            if issue_id not in unique_issues:
                unique_issues[issue_id] = item

    # =========================================================
    # FALLBACK
    # =========================================================
    #
    # We only broaden the search if the focused contribution
    # searches don't give us enough candidates.
    # =========================================================

    if len(unique_issues) < NIM_CANDIDATE_LIMIT:

        fallback_results = await _search_github(
            query=base_query,
            headers=headers,
        )

        for item in fallback_results:

            issue_id = item.get("id")

            if not issue_id:
                continue

            if issue_id not in unique_issues:
                unique_issues[issue_id] = item

    # =========================================================
    # DETERMINISTIC FILTER
    # =========================================================

    candidates = []

    for item in unique_issues.values():

        if is_low_value_issue(item):
            continue

        candidates.append(item)

    # =========================================================
    # RANK
    # =========================================================

    candidates.sort(
        key=get_issue_score,
        reverse=True,
    )

    # =========================================================
    # NIM BUDGET
    # =========================================================

    candidates = candidates[
        :NIM_CANDIDATE_LIMIT
    ]

    # =========================================================
    # NORMALIZE
    # =========================================================

    issues = [
        normalize_issue(item)
        for item in candidates
    ]

    # =========================================================
    # DEBUG
    # =========================================================

    print(
        "\n========== GITHUB CANDIDATE PIPELINE =========="
    )

    print(
        "Focus skill:",
        focus_skill,
    )

    for name, results in raw_results.items():

        print(
            f"{name}:",
            len(results),
        )

    print(
        "Unique raw candidates:",
        len(unique_issues),
    )

    print(
        "After deterministic filtering:",
        len(
            [
                item
                for item in unique_issues.values()
                if not is_low_value_issue(item)
            ]
        ),
    )

    print(
        "Sent to NIM:",
        len(issues),
    )

    for index, issue in enumerate(
        issues,
        start=1,
    ):

        print(
            f"{index}. "
            f"{issue['repository']} — "
            f"{issue['title']} | "
            f"labels={issue['labels']}"
        )

    print(
        "================================================\n"
    )

    # =========================================================
    # NO CANDIDATES
    # =========================================================

    if not issues:

        return {
            "focus_skill": focus_skill,
            "total_candidates": 0,
            "matches": [],
            "issues": [],
        }

    # =========================================================
    # NIM
    # =========================================================

    try:

        matches = await evaluate_issues(
            focus_skill=focus_skill,
            known_skills=known_skills,
            experience=experience,
            contributions=contributions,
            target_role=target_role,
            issues=issues,
        )

    except Exception as error:

        print(
            "NIM EVALUATION ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=502,
            detail="Issue relevance analysis failed.",
        ) from error

    # =========================================================
    # ONLY RECOMMENDED MATCHES
    # =========================================================

    recommended_matches = [
        match
        for match in matches
        if match.get("recommended") is True
    ]

    # =========================================================
    # MATCH → ISSUE
    # =========================================================

    issue_by_id = {
        issue["id"]: issue
        for issue in issues
    }

    recommended_issues = []

    for match in recommended_matches:

        issue = issue_by_id.get(
            match["issue_id"]
        )

        if issue:
            recommended_issues.append(
                issue
            )

    # =========================================================
    # SORT BY NIM SCORE
    # =========================================================

    recommended_matches.sort(
        key=lambda match: match.get(
            "relevance_score",
            0,
        ),
        reverse=True,
    )

    # =========================================================
    # FINAL DEBUG
    # =========================================================

    print(
        "\n========== NIM RECOMMENDATIONS =========="
    )

    for match in recommended_matches:

        print(
            match["issue_id"],
            "| score:",
            match["relevance_score"],
            "| difficulty:",
            match["difficulty_fit"],
            "| stack:",
            match["stack_fit"],
            "| beginner:",
            match["beginner_suitable"],
            "| scope:",
            match["scope"],
        )

    print(
        "==========================================\n"
    )

    # =========================================================
    # FINAL RESPONSE
    # =========================================================

    return {
        "focus_skill": focus_skill,
        "total_candidates": len(issues),
        "matches": recommended_matches,
        "issues": recommended_issues,
    }