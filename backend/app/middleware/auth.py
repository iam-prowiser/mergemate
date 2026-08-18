from fastapi import Header, HTTPException, status
from firebase_admin import auth

# Initialize Firebase Admin SDK
from app.core import firebase


async def get_current_user(
    authorization: str | None = Header(default=None),
):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header.",
        )

    id_token = authorization.removeprefix("Bearer ").strip()

    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
        )

    try:
        decoded_token = auth.verify_id_token(id_token)

        return decoded_token

    except Exception as error:
        print(
            "Firebase token verification failed:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )