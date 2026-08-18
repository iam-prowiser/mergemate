from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user

from app.schemas.github import (
    GitHubSearchRequest,
    GitHubSearchResponse,
)

from app.services.github_service import (
    search_github_issues,
)


router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.post(
    "/search",
    response_model=GitHubSearchResponse,
)
async def search_issues(
    request: GitHubSearchRequest,
    current_user=Depends(get_current_user),
):

    return await search_github_issues(
        focus_skill=request.focus_skill,
        known_skills=request.known_skills,
        experience=request.experience,
        contributions=request.contributions,
        target_role=request.target_role,
    )