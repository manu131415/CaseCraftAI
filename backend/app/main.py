from typing import Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.apis.complaints import router as complaints_router
from app.apis.cases import router as cases_router
from app.apis.case_diary import router as case_diary_router
from app.apis.accused import router as accused_router
from app.apis.victims import router as victims_router
from app.apis.witnesses import router as witnesses_router
from app.apis.medical_reports import router as medical_reports_router
from app.apis.remand_details import router as remand_details_router
from app.apis.court_custody import router as court_custody_router
from app.apis.case_legal_sections import router as case_legal_sections_router
from app.apis.legal_sections import router as legal_sections_router
from app.apis.legal_section_mappings import router as legal_section_mappings_router
from app.apis.recommendations import router as recommendations_router
from app.apis.fir_drafts import router as fir_drafts_router
from app.apis.landmarks import router as landmarks_router
from app.apis.legal_section_intelligence import router as legal_section_intelligence_router

app = FastAPI(title="CaseCraftAI", description="Case management API for complaints, cases, and investigation diary workflows.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://casecraftai-frontend.onrender.com", "http://localhost:3000",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints_router)
app.include_router(cases_router)
app.include_router(case_diary_router)
app.include_router(accused_router)
app.include_router(victims_router)
app.include_router(witnesses_router)
app.include_router(medical_reports_router)
app.include_router(remand_details_router)
app.include_router(court_custody_router)
app.include_router(case_legal_sections_router)
app.include_router(legal_sections_router)
app.include_router(legal_section_mappings_router)
app.include_router(recommendations_router)
app.include_router(fir_drafts_router)
app.include_router(landmarks_router)
app.include_router(legal_section_intelligence_router)

@app.get(
    "/health",
    response_model=Dict[str, str],
    summary="Health check",
    description="Return the current API health status.",
    tags=["system"],
)
def health_check():
    return {"status": "ok"}
