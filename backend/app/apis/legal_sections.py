from fastapi import APIRouter

router = APIRouter(prefix="/api/legal-sections", tags=["Legal Sections"])

@router.get("/")
def get_legal_sections():
    return {"message": "Legal sections endpoint"}
