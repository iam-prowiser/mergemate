from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router
from app.api.routes.ai import router as ai_router
from app.api.routes.github import router as github_router

from app.core.config import settings


app = FastAPI(
    title="MergeMate API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "mergemate-api",
    }


app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    resume_router,
    prefix="/api",
)

app.include_router(
    ai_router,
    prefix="/api",
)

app.include_router(
    github_router,
    prefix="/api",
)