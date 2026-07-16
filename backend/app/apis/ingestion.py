from fastapi import APIRouter

router = APIRouter(prefix="/api/ingestion", tags=["Ingestion"])

@router.get("/")
def get_ingestion():
    return {"message": "Ingestion endpoint"}
