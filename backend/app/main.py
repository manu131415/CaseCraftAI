from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.apis import recommendations

app = FastAPI(title="CaseCraft AI")

app.include_router(recommendations.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this later
    allow_methods=["*"],
    allow_headers=["*"],
)