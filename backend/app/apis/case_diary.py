from fastapi import APIRouter

router = APIRouter(prefix="/api/case-diaries", tags=["Case Diaries"])

@router.get("/")
def get_case_diaries():
    return {"message": "Case diaries endpoint"}
