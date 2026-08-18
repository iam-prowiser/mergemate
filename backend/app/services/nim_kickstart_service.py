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
    Extract JSON even if NIM wraps the response
    inside a markdown code block.
    """

    text = text.strip()

    # Direct JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # ```json ... ```
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

    # Find first JSON object
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
# PROMPT
# ============================================================

def _build_prompt(
    issue,
    developer,
) -> str:

    return f"""
You are the AI Kickstart Guide for MergeMate.

Your job is to help a developer understand how to BEGIN
working on a real GitHub issue.

You are NOT solving the issue.

You are NOT writing the complete implementation.

You are NOT inventing repository files.

You are giving the developer a practical starting plan.

============================================================
DEVELOPER
============================================================

Focus skill:
{developer.focus_skill}

Known skills:
{json.dumps(developer.known_skills)}

Experience:
{developer.experience}

Open-source contribution experience:
{developer.contributions}

Target role:
{developer.target_role or "Not specified"}

============================================================
GITHUB ISSUE
============================================================

Repository:
{issue.repository}

Title:
{issue.title}

Labels:
{json.dumps(issue.labels)}

Description:
{issue.description}

============================================================
STRICT RULES
============================================================

1. Use ONLY the information supplied above.

2. Do not invent repository files.

3. Do not claim that a specific file exists unless the
   issue description explicitly mentions that file.

4. If the exact file location is unknown, tell the developer
   to inspect the repository structure.

5. Do not pretend that you inspected the repository.

6. Keep the advice appropriate for the developer's experience.

7. The developer may be a beginner.

8. Break complicated work into practical first steps.

9. Explain technical terms briefly when necessary.

10. Do not solve the entire issue for the developer.

11. Help the developer understand what to do next.

12. Be conservative rather than hallucinating.

13. Prefer actionable advice over generic explanations.

============================================================
RETURN FORMAT
============================================================

Return ONLY valid JSON.

{{
  "issue_summary": "Short explanation of what the issue is asking.",

  "what_you_need_to_know": [
    "Concept or technology the developer should understand first."
  ],

  "where_to_start": [
    "Practical first thing to inspect or understand."
  ],

  "implementation_steps": [
    "Small practical step.",
    "Next practical step."
  ],

  "verification_steps": [
    "How to check whether the change works."
  ],

  "definition_of_done": [
    "Concrete condition that means the issue is complete."
  ]
}}

Keep every item concise and actionable.
"""


# ============================================================
# GENERATE KICKSTART GUIDE
# ============================================================

async def generate_kickstart(
    issue,
    developer,
) -> dict:

    client = OpenAI(
        base_url=NVIDIA_BASE_URL,
        api_key=settings.nvidia_api_key,
    )

    prompt = _build_prompt(
        issue=issue,
        developer=developer,
    )

    # --------------------------------------------------------
    # NIM REQUEST
    # --------------------------------------------------------

    completion = client.chat.completions.create(
        model=NVIDIA_MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict technical mentor "
                    "for open-source contributors. "
                    "Return JSON only."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],

        temperature=0.2,

        top_p=0.9,

        max_tokens=1200,

        extra_body={
            "chat_template_kwargs": {
                "enable_thinking": False,
            }
        },
    )

    # --------------------------------------------------------
    # READ RESPONSE
    # --------------------------------------------------------

    content = (
        completion
        .choices[0]
        .message
        .content
    )

    if not content:
        raise ValueError(
            "NIM returned an empty response."
        )

    # --------------------------------------------------------
    # PARSE JSON
    # --------------------------------------------------------

    result = _extract_json(content)

    # --------------------------------------------------------
    # NORMALIZE RESPONSE
    # --------------------------------------------------------

    return {
        "issue_summary": str(
            result.get(
                "issue_summary",
                "",
            )
        ),

        "what_you_need_to_know": [
            str(item)
            for item in result.get(
                "what_you_need_to_know",
                [],
            )
        ],

        "where_to_start": [
            str(item)
            for item in result.get(
                "where_to_start",
                [],
            )
        ],

        "implementation_steps": [
            str(item)
            for item in result.get(
                "implementation_steps",
                [],
            )
        ],

        "verification_steps": [
            str(item)
            for item in result.get(
                "verification_steps",
                [],
            )
        ],

        "definition_of_done": [
            str(item)
            for item in result.get(
                "definition_of_done",
                [],
            )
        ],
    }