from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.retrieval import get_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class CaseSummaryRequest(BaseModel):
    case_summary: str


@router.post("/")
async def recommend(request: CaseSummaryRequest):
    if not request.case_summary or len(request.case_summary.strip()) < 10:
        raise HTTPException(status_code=400, detail="case_summary is too short")

    try:
        result = get_recommendations(request.case_summary)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))