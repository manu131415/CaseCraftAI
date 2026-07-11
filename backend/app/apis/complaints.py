from fastapi import APIRouter

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("/")
def get_complaints():
    return {"message": "Complaints endpoint"}
