import json
import re

from openai import OpenAI

from app.core.config import settings


NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

NVIDIA_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b"


# ============================================================
# JSON EXTRACTION
# ============================================================

def _extract_json(text: str) -> dict:
    """
    Extract JSON even if NIM accidentally wraps it
    inside a markdown code block or surrounding text.
    """

    text = text.strip()

    # --------------------------------------------------------
    # Direct JSON
    # --------------------------------------------------------

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # Markdown JSON block
    # --------------------------------------------------------

    code_block = re.search(
        r"```(?:json)?\s*(.*?)\s*```",
        text,
        re.DOTALL,
    )

    if code_block:

        try:
            return json.loads(
                code_block.group(1)
            )

        except json.JSONDecodeError:
            pass

    # --------------------------------------------------------
    # First JSON object inside response
    # --------------------------------------------------------

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:

        try:
            return json.loads(
                text[start:end + 1]
            )

        except json.JSONDecodeError:
            pass

    raise ValueError(
        "NIM returned invalid JSON."
    )


# ============================================================
# PROMPT BUILDER
# ============================================================

def _build_prompt(
    focus_skill: str,
    known_skills: list[str],
    experience: str,
    contributions: str,
    target_role: str,
    issues: list[dict],
) -> str:

    issue_data = []

    for issue in issues:

        issue_data.append(
            {
                "issue_id": issue["id"],
                "repository": issue["repository"],
                "title": issue["title"],
                "description": issue["description"][:5000],
                "labels": issue["labels"],
            }
        )

    return f"""
You are the STRICT issue-matching engine for MergeMate.

Your job is to evaluate REAL GitHub issues for ONE developer.

You are NOT a search engine.

You MUST NOT:

- search for other issues
- invent missing information
- invent technologies
- invent repository details
- invent issue requirements
- rewrite GitHub issue content
- assume a GitHub label guarantees difficulty
- assume that a large repository means every issue is difficult
- assume that a beginner cannot contribute to a professional repository

Only evaluate the supplied candidate issues.


==================================================
DEVELOPER PROFILE
==================================================

Focus skill:
{focus_skill}

Known skills:
{json.dumps(known_skills)}

Experience:
{experience}

Open-source contribution experience:
{contributions}

Target role:
{target_role or "Not specified"}


==================================================
CORE MERGEMATE MATCHING RULE
==================================================

MergeMate does NOT simply search for issues containing the
developer's selected skill.

The selected skill is the developer's CURRENT GROWTH TARGET.

The broader known stack represents the developer's CURRENT FOUNDATION.

A good recommendation should therefore answer:

"Can THIS developer realistically contribute to THIS SPECIFIC issue,
while gaining meaningful experience in their selected skill?"

The issue does NOT need to use the developer's entire stack.

For example:

Developer:
Python, FastAPI, PostgreSQL

Focus skill:
PyTorch

An issue requiring:

Python + PyTorch

can be an excellent match.

It does NOT need to also use:

FastAPI + PostgreSQL.


==================================================
FOCUS SKILL RELEVANCE
==================================================

The focus skill must have meaningful relevance to the ACTUAL WORK.

Do NOT recommend an issue merely because:

- the repository uses the focus skill
- the repository name contains the focus skill
- the focus skill appears in unrelated environment information
- the focus skill appears in an unrelated dependency list
- the focus skill appears somewhere in the issue without being relevant
  to the actual contribution

Ask:

"Will working on this issue actually help the developer learn,
practice, or contribute using the focus skill?"

If the answer is no, relevance should be low.


==================================================
BROADER STACK RULE
==================================================

The broader stack matters, but it is NOT an AND requirement.

Do NOT require every known skill to appear in the issue.

Instead determine whether the developer has enough foundation
to realistically approach the issue.

Example:

Developer:
Python
FastAPI
PostgreSQL
PyTorch

Issue:
Python + PyTorch CLI change

This can have:

stack_fit = "high"

even though FastAPI and PostgreSQL are not used.

Another example:

Developer:
Python
PyTorch

Issue:
CUDA kernel optimization requiring advanced GPU programming

This should have:

stack_fit = "low"

because the issue requires expertise that is not established
by the supplied developer profile.


==================================================
BEGINNER RULE — CRITICAL
==================================================

The developer being a beginner does NOT mean:

"reject every technically meaningful issue."

A beginner can absolutely make their first contribution
to a large and professional open-source repository.

In fact, this is one of the primary purposes of:

- good first issue
- help wanted
- easy
- beginner
- starter contribution

DO NOT reject an issue merely because:

- the developer has no previous OSS contributions
- the repository is famous
- the repository is large
- the issue is in a professional project

Instead judge the ACTUAL ISSUE.

A beginner-friendly issue can exist inside:

- PyTorch
- Hugging Face
- Microsoft
- Google
- Meta
- NVIDIA
- other major repositories

The repository size is NOT the difficulty.

The INDIVIDUAL ISSUE is the difficulty.


==================================================
WHAT MAKES AN ISSUE BEGINNER-SUITABLE
==================================================

Consider:

1. Scope
2. Technical complexity
3. Required domain knowledge
4. Explicit technologies
5. Implementation guidance
6. Acceptance criteria
7. Estimated effort
8. Developer's known skills
9. Whether the developer needs deep knowledge of the entire
   repository
10. Whether the task is reasonably isolated

Strong beginner signals include:

- good first issue
- help wanted
- easy
- clearly defined acceptance criteria
- specific files to modify
- estimated effort
- small isolated implementation
- documentation improvement
- small test
- small bug fix
- bounded CLI/tooling task
- simple error handling
- straightforward refactor

These are signals, NOT guarantees.

Always inspect the actual issue.


==================================================
DO NOT CONFUSE "BEGINNER" WITH "NON-TECHNICAL"
==================================================

A beginner developer may still know:

- Python
- JavaScript
- React
- FastAPI
- PostgreSQL
- PyTorch
- Git
- APIs
- testing
- CLI development

"Beginner" means limited professional/open-source experience.

It does NOT mean:

"cannot write code."

Therefore, if a small issue requires Python and PyTorch and
the developer knows Python and selected PyTorch as their focus,
the issue may be beginner_suitable = true.


==================================================
ISSUES THAT SHOULD GENERALLY BE REJECTED FOR BEGINNERS
==================================================

Be highly cautious with:

- compiler internals
- kernel programming
- CUDA optimization
- GPU driver debugging
- distributed systems
- major architectural redesign
- large migrations
- repository-wide refactors
- complex performance engineering
- advanced mathematical/research implementations
- large infrastructure changes
- hardware-specific debugging
- tasks requiring specialized production experience
- issues with very broad or undefined scope

These may still be recommended if the developer profile clearly
contains the required expertise.

Otherwise reject them.


==================================================
LARGE REPOSITORY RULE
==================================================

A large repository is NOT a rejection criterion.

For example:

Repository:
PyTorch

Issue:
"Add a small CLI command with clear acceptance criteria."

This can be beginner_suitable.

Repository:
Small personal project

Issue:
"Rewrite the distributed execution engine."

This may NOT be beginner_suitable.

Always judge:

ISSUE DIFFICULTY

not:

REPOSITORY SIZE.


==================================================
EVIDENCE RULE
==================================================

Every factual claim about an issue MUST be supported by:

- repository
- title
- description
- labels

Do NOT invent information.

For example, if the issue says:

"PyTorch + CUDA"

that is issue information.

It does NOT mean the developer uses CUDA.

Only the DEVELOPER PROFILE tells you what the developer knows.


==================================================
EVIDENCE ARRAY
==================================================

Return 1–3 concise evidence statements.

Every evidence statement must be directly supported
by the supplied issue.

GOOD:

"Issue is labeled good first issue."

"Description estimates approximately 2–3 hours."

"Issue provides specific implementation requirements."

BAD:

"Project uses FastAPI."

if FastAPI does not appear in the supplied issue.


==================================================
SCOPE
==================================================

Use exactly one:

"small"
"medium"
"large"
"unknown"

SMALL:

- isolated bug
- focused documentation change
- small test
- bounded CLI task
- simple error handling
- small self-contained implementation

MEDIUM:

- several related files
- moderate implementation
- contained feature
- moderate debugging task

LARGE:

- architectural redesign
- major subsystem changes
- compiler internals
- distributed systems
- large performance rewrites
- repository-wide changes
- complex infrastructure

UNKNOWN:

Use only when there is genuinely insufficient evidence.


==================================================
DIFFICULTY FIT
==================================================

difficulty_fit describes suitability for THIS developer.

Allowed:

"good"
"moderate"
"poor"

IMPORTANT:

For beginners:

A small, well-defined issue that uses their known skills
should normally be:

difficulty_fit = "good"

Do NOT mark it "moderate" simply because:

- they have no OSS experience
- the repository is large
- the issue is technically real
- the project is professional

Those are NOT sufficient reasons.


==================================================
STACK FIT
==================================================

stack_fit describes compatibility between:

ISSUE REQUIREMENTS

and

DEVELOPER FOUNDATION.


Allowed:

"high"
"medium"
"low"

High:

The developer already has most of the foundation required.

Medium:

The developer has a reasonable foundation but must learn
some new concepts.

Low:

The issue depends heavily on technologies or expertise
not established in the developer profile.


==================================================
BEGINNER SUITABILITY
==================================================

Return:

beginner_suitable = true

when the specific developer could realistically approach
and complete the issue.

Return:

beginner_suitable = false

when the issue is beyond the developer's current foundation,
scope is too large, requirements are too specialized,
or there is insufficient evidence.

IMPORTANT:

Do NOT require:

- previous OSS contribution
- explicit "beginner" label
- "good first issue" label

Those are signals, not requirements.


==================================================
RECOMMENDATION GATE
==================================================

For a beginner developer:

recommended = true ONLY when:

beginner_suitable = true

AND

difficulty_fit = "good"

AND

scope = "small" OR "medium"

AND

relevance_score >= 75

AND

stack_fit = "high" OR "medium"

AND

the focus skill has meaningful relevance to the actual work.

Otherwise:

recommended = false.


==================================================
QUALITY OVERRIDE
==================================================

Even if all numeric conditions look good, DO NOT recommend
an issue if the issue is clearly misleading for the developer.

Examples:

Focus:
PyTorch

Issue:
"Update unrelated website CSS."

Even if labeled good first issue:

recommended = false

because the issue provides no meaningful PyTorch contribution.

Another example:

Focus:
PyTorch

Issue:
"Add a small Python CLI around an existing PyTorch registry."

Developer:
Python + PyTorch

This can be:

recommended = true

even if the repository is huge.


==================================================
SCORING
==================================================

90-100 = excellent match
75-89  = strong match
60-74  = possible match
0-59   = poor match

Consider:

- focus skill relevance
- broader stack compatibility
- actual issue difficulty
- scope
- clarity
- required domain knowledge
- learning value
- beginner accessibility

DO NOT inflate the score merely because the focus skill
appears in the issue.

DO NOT reduce the score merely because the developer
has never contributed to open source.


==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Return exactly ONE evaluation object for EVERY supplied issue.

Required format:

{{
  "matches": [
    {{
      "issue_id": 123,
      "relevance_score": 88,
      "difficulty_fit": "good",
      "stack_fit": "high",
      "beginner_suitable": true,
      "scope": "small",
      "evidence": [
        "Issue is labeled good first issue.",
        "Description provides specific implementation requirements.",
        "Issue is narrowly scoped."
      ],
      "reason": "The issue is small, clearly defined, relevant to the focus skill, and compatible with the developer's existing foundation.",
      "learning_value": "Provides practical experience with the focus skill through a realistic first contribution.",
      "recommended": true
    }}
  ]
}}

Keep:

evidence
reason
learning_value

concise.


==================================================
FINAL DECISION TEST
==================================================

Before marking recommended = true, ask yourself:

1. Is the focus skill genuinely relevant?

2. Does the developer have enough foundation?

3. Is the individual issue small or reasonably bounded?

4. Can a beginner realistically understand and complete it?

5. Does the issue provide meaningful contribution or learning value?

6. Am I rejecting it ONLY because the repository is large or
   because the developer has no OSS experience?

If the answer to #6 is yes:

DO NOT reject it.

==================================================
CANDIDATE ISSUES
==================================================

{json.dumps(issue_data, indent=2)}
"""


# ============================================================
# NIM EVALUATION
# ============================================================

async def evaluate_issues(
    focus_skill: str,
    known_skills: list[str],
    experience: str,
    contributions: str,
    target_role: str,
    issues: list[dict],
) -> list[dict]:

    if not issues:
        return []

    client = OpenAI(
        base_url=NVIDIA_BASE_URL,
        api_key=settings.nvidia_api_key,
    )

    prompt = _build_prompt(
        focus_skill=focus_skill,
        known_skills=known_skills,
        experience=experience,
        contributions=contributions,
        target_role=target_role,
        issues=issues,
    )

    # --------------------------------------------------------
    # CALL NIM
    # --------------------------------------------------------

    completion = client.chat.completions.create(
        model=NVIDIA_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict GitHub issue relevance "
                    "evaluator for MergeMate. "
                    "Use only supplied evidence. "
                    "Evaluate the actual issue, not repository "
                    "reputation. "
                    "Do not reject beginner issues merely because "
                    "the developer has no OSS experience. "
                    "Return JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.15,
        top_p=0.9,
        max_tokens=4000,
        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False,
            }
        },
    )

    content = completion.choices[0].message.content

    if not content:
        raise ValueError(
            "NIM returned an empty response."
        )

    parsed = _extract_json(content)

    # --------------------------------------------------------
    # DEBUG RAW RESPONSE
    # --------------------------------------------------------

    print(
        "\n========== RAW NIM RESPONSE =========="
    )

    print(
        json.dumps(
            parsed,
            indent=2,
        )
    )

    print(
        "======================================\n"
    )

    matches = parsed.get(
        "matches",
        [],
    )

    if not isinstance(matches, list):
        matches = []

    # --------------------------------------------------------
    # VALID ISSUE IDS
    # --------------------------------------------------------

    valid_ids = {
        issue["id"]
        for issue in issues
    }

    print(
        "\n========== MATCH DEBUG =========="
    )

    print(
        "VALID ISSUE IDS:",
        valid_ids,
    )

    for match in matches:

        issue_id = match.get(
            "issue_id"
        )

        print(
            "NIM ISSUE:",
            issue_id,
            "TYPE:",
            type(issue_id),
            "IN VALID IDS:",
            issue_id in valid_ids,
        )

    print(
        "EXPERIENCE:",
        repr(experience),
    )

    print(
        "================================\n"
    )

    # --------------------------------------------------------
    # CLEAN MATCHES
    # --------------------------------------------------------

    cleaned_matches = []

    for match in matches:

        if not isinstance(
            match,
            dict,
        ):
            continue

        issue_id = match.get(
            "issue_id"
        )

        # Never allow NIM to invent issue IDs.
        if issue_id not in valid_ids:
            continue

        # ----------------------------------------------------
        # NORMALIZE VALUES
        # ----------------------------------------------------

        difficulty_fit = str(
            match.get(
                "difficulty_fit",
                "poor",
            )
        ).lower().strip()

        if difficulty_fit not in {
            "good",
            "moderate",
            "poor",
        }:
            difficulty_fit = "poor"

        stack_fit = str(
            match.get(
                "stack_fit",
                "low",
            )
        ).lower().strip()

        if stack_fit not in {
            "high",
            "medium",
            "low",
        }:
            stack_fit = "low"

        scope = str(
            match.get(
                "scope",
                "unknown",
            )
        ).lower().strip()

        if scope not in {
            "small",
            "medium",
            "large",
            "unknown",
        }:
            scope = "unknown"

        beginner_suitable = bool(
            match.get(
                "beginner_suitable",
                False,
            )
        )

        # ----------------------------------------------------
        # NORMALIZE SCORE
        # ----------------------------------------------------

        try:

            relevance_score = int(
                match.get(
                    "relevance_score",
                    0,
                )
            )

        except (
            TypeError,
            ValueError,
        ):

            relevance_score = 0

        relevance_score = max(
            0,
            min(
                100,
                relevance_score,
            ),
        )

        # ----------------------------------------------------
        # EVIDENCE
        # ----------------------------------------------------

        evidence = match.get(
            "evidence",
            [],
        )

        if not isinstance(
            evidence,
            list,
        ):
            evidence = []

        evidence = [
            str(item).strip()
            for item in evidence[:3]
            if str(item).strip()
        ]

        # ----------------------------------------------------
        # TEXT
        # ----------------------------------------------------

        reason = str(
            match.get(
                "reason",
                "",
            )
        ).strip()

        learning_value = str(
            match.get(
                "learning_value",
                "",
            )
        ).strip()

        # ----------------------------------------------------
        # MODEL RECOMMENDATION
        # ----------------------------------------------------

        recommended = bool(
            match.get(
                "recommended",
                False,
            )
        )

        # ----------------------------------------------------
        # HARD BEGINNER GATE
        #
        # IMPORTANT:
        #
        # Beginner does NOT mean no OSS experience.
        #
        # We only reject if the ISSUE itself is unsuitable.
        # ----------------------------------------------------

        if experience.lower().strip() == "beginner":

            if not beginner_suitable:
                recommended = False

            if difficulty_fit != "good":
                recommended = False

            if scope not in {
                "small",
                "medium",
            }:
                recommended = False

            if relevance_score < 75:
                recommended = False

            if stack_fit not in {
                "high",
                "medium",
            }:
                recommended = False

        # ----------------------------------------------------
        # GENERAL QUALITY GATE
        # ----------------------------------------------------

        if relevance_score < 60:
            recommended = False

        if stack_fit == "low":
            recommended = False

        if scope == "large":
            recommended = False

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print(
            "\nPASSING GATE:",
            issue_id,
            "| score:",
            relevance_score,
            "| difficulty:",
            difficulty_fit,
            "| stack:",
            stack_fit,
            "| beginner:",
            beginner_suitable,
            "| scope:",
            scope,
            "| recommended:",
            recommended,
        )

        # ----------------------------------------------------
        # STORE
        # ----------------------------------------------------

        cleaned_matches.append(
            {
                "issue_id": issue_id,
                "relevance_score": relevance_score,
                "difficulty_fit": difficulty_fit,
                "stack_fit": stack_fit,
                "beginner_suitable": (
                    beginner_suitable
                ),
                "scope": scope,
                "evidence": evidence,
                "reason": reason,
                "learning_value": learning_value,
                "recommended": recommended,
            }
        )

    # --------------------------------------------------------
    # SORT
    #
    # Recommended first, then score.
    # --------------------------------------------------------

    cleaned_matches.sort(
        key=lambda item: (
            item["recommended"],
            item["relevance_score"],
        ),
        reverse=True,
    )

    # --------------------------------------------------------
    # FINAL RECOMMENDATIONS DEBUG
    # --------------------------------------------------------

    recommendations = [
        item
        for item in cleaned_matches
        if item["recommended"]
    ]

    print(
        "\n========== NIM RECOMMENDATIONS =========="
    )

    print(
        json.dumps(
            recommendations,
            indent=2,
        )
    )

    print(
        "==========================================\n"
    )

    return cleaned_matches