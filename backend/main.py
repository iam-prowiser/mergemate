from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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