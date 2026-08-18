from pydantic import BaseModel


class SkillGapRequest(BaseModel):
    resume_markdown: str | None = None
    target_role: str
    experience: str
    contributions: str


class CurrentSkill(BaseModel):
    name: str
    level: str
    evidence: str


class SkillGap(BaseModel):
    skill: str
    priority: str
    reason: str


class CareerPathStep(BaseModel):
    title: str
    technologies: list[str]
    status: str


class Recommendation(BaseModel):
    title: str
    explanation: str


class SkillGapResponse(BaseModel):
    target_role: str
    profile_summary: str
    current_skills: list[CurrentSkill]
    skill_gaps: list[SkillGap]
    career_path: list[CareerPathStep]
    recommendations: list[Recommendation]

class KickstartIssue(BaseModel):
    repository: str
    title: str
    description: str
    labels: list[str] = []


class KickstartDeveloper(BaseModel):
    focus_skill: str
    known_skills: list[str] = []
    experience: str
    contributions: str
    target_role: str = ""


class KickstartRequest(BaseModel):
    issue: KickstartIssue
    developer: KickstartDeveloper


class KickstartResponse(BaseModel):
    issue_summary: str

    what_you_need_to_know: list[str]

    where_to_start: list[str]

    implementation_steps: list[str]

    verification_steps: list[str]

    definition_of_done: list[str]