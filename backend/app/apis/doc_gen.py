from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.db import get_db

from app.schemas.doc_gen import GenerateDocumentRequest

from app.services.doc_engine.engine import DocumentEngine

router = APIRouter(
    prefix="/doc-gen",
    tags=["Document Generation"],
)

@router.post("/generate")
def generate_document(
    request: GenerateDocumentRequest,
    db: Session = Depends(get_db),
):

    engine = DocumentEngine(db)

    buffer = engine.generate(

        case_id=request.case_id,

        document_type=request.document_type,

        language=request.language,

    )

    filename = (
        f"{request.document_type}_{request.case_id}.docx"
    )

    return StreamingResponse(

        buffer,

        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),

        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        },

    )