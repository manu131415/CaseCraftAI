from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.db import get_db

from ..schemas.document import (
    GenerateDocumentRequest,
)

from ..services.doc_engine.engine import DocumentEngine
from app.services.doc_engine.exceptions import (
    DocumentGenerationError,
)

router = APIRouter(
    prefix="/api/documents",
    tags=["Document Generation"],
)


@router.post("/generate")
def generate_document(
    request: GenerateDocumentRequest,
    db: Session = Depends(get_db),
):
    """
    Generate a document for a case.
    """

    try:

        engine = DocumentEngine(db)

        output = engine.generate(
            case_id=request.case_id,
            document_type=request.document_type,
            language=request.language,
        )

        filename = (
            f"{request.document_type}_{request.case_id}.docx"
        )

        return StreamingResponse(
            output,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition":
                f'attachment; filename="{filename}"'
            },
        )

    except DocumentGenerationError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unexpected Error: {e}",
        )