from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user

from app.schemas.ai import (
    SkillGapRequest,
    SkillGapResponse,
    KickstartRequest,
    KickstartResponse,
)

from app.services.ai_service import (
    analyze_skill_gap,
)

from app.services.nim_kickstart_service import (
    generate_kickstart,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


# ============================================================
# SKILL GAP
# ============================================================

@router.post(
    "/skill-gap",
    response_model=SkillGapResponse,
)
async def skill_gap_analysis(
    request: SkillGapRequest,
    current_user=Depends(get_current_user),
):
    result = analyze_skill_gap(
        resume_markdown=request.resume_markdown or "",
        target_role=request.target_role,
        experience=request.experience,
        contributions=request.contributions,
    )

    return result


# ============================================================
# AI KICKSTART GUIDE
# ============================================================

@router.post(
    "/kickstart",
    response_model=KickstartResponse,
)
async def kickstart_guide(
    request: KickstartRequest,
    current_user=Depends(get_current_user),
):
    result = await generate_kickstart(
        issue=request.issue,
        developer=request.developer,
    )

    return result