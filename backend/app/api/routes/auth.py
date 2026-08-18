from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user),
):
    return {
        "message": "Authentication successful.",
        "user": {
            "uid": current_user["uid"],
            "email": current_user.get("email"),
        },
    }

@router.get("/me")
async def me(
    current_user=Depends(get_current_user),
):
    return {
        "authenticated": True,
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
    }