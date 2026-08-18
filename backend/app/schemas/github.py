from pydantic import BaseModel, Field


class GitHubSearchRequest(BaseModel):
    focus_skill: str = Field(
        min_length=1,
        max_length=100,
    )

    known_skills: list[str] = Field(
        default_factory=list,
        max_length=30,
    )

    experience: str = Field(
        min_length=1,
        max_length=50,
    )

    contributions: str = Field(
        min_length=1,
        max_length=50,
    )

    target_role: str = Field(
        default="",
        max_length=100,
    )


class GitHubIssue(BaseModel):
    id: int
    repository: str
    title: str
    description: str
    url: str
    labels: list[str]
    state: str
    updated_at: str


class GitHubMatch(BaseModel):
    issue_id: int
    relevance_score: int

    difficulty_fit: str
    stack_fit: str

    beginner_suitable: bool
    scope: str

    evidence: list[str] = Field(
        default_factory=list
    )

    reason: str
    learning_value: str

    recommended: bool


class GitHubSearchResponse(BaseModel):
    focus_skill: str

    total_candidates: int

    matches: list[GitHubMatch]

    issues: list[GitHubIssue]