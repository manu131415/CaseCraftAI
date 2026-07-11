from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.apis.complaints import router as complaints_router
from app.apis.cases import router as cases_router
from app.apis.case_diary import router as case_diary_router
from app.apis.recommendations import router as recommendations
app = FastAPI(title="CaseCraftAI", description="Case management API for complaints, cases, and investigation diary workflows.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(cases_router)
app.include_router(case_diary_router)
app.include_router(recommendations)

@app.get(
    "/health",
    response_model=Dict[str, str],
    summary="Health check",
    description="Return the current API health status.",
    tags=["system"],
)
def health_check():
    return {"status": "ok"}
