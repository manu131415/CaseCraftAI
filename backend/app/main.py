import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.apis.case_diary import router as case_diary_router
from app.apis.complaints import router as complaints_router
from app.apis.ingestion import router as ingestion_router
from app.apis.legal_sections import router as legal_sections_router
from app.apis.documents import router as documents_router

app = FastAPI(
    title="CaseCraftAI Backend API",
    description="AI-Powered FIR Drafting and Investigation Assistance Platform",
    version="1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(case_diary_router)
app.include_router(complaints_router)
app.include_router(ingestion_router)
app.include_router(legal_sections_router)
app.include_router(documents_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CaseCraftAI API Server"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
