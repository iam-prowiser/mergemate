import traceback

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.middleware.auth import get_current_user
from app.services.resume_service import (
    convert_resume_to_markdown,
)


router = APIRouter(
    prefix="/resume",
    tags=["Resume"],
)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    try:
        markdown = convert_resume_to_markdown(
            file_bytes,
            file.filename or "resume.pdf",
        )

        return {
            "message": "Resume processed successfully.",
            "filename": file.filename,
            "markdown": markdown,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print("\n========== RESUME ERROR ==========")
        print(error)
        traceback.print_exc()
        print("==================================\n")

        raise HTTPException(
            status_code=500,
            detail="Failed to process resume."
        )