from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.resume import router as resume_router
from app.api.routes.ai import router as ai_router
from app.api.routes.github import router as github_router


app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://mergemate-neon.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "mergemate-api",
    }


# --------------------------------------------------
# API Routes
# --------------------------------------------------

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