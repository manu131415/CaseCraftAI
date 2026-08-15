import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import get_db
from models.document import Document
from models.case import Case

from ..schemas.document import GenerateDocumentRequest
from ..services.doc_engine.engine import DocumentEngine
from app.services.doc_engine.exceptions import DocumentGenerationError

router = APIRouter(
    prefix="/api/documents",
    tags=["Document Generation"],
)

class DocumentStatusUpdate(BaseModel):
    status: str
    comments: Optional[str] = None


@router.post("/generate")
def generate_document(
    request: GenerateDocumentRequest,
    db: Session = Depends(get_db),
):
    try:
        # 1. Fetch case details
        case_record = db.query(Case).filter(Case.case_id == request.case_id).first()
        complaint_id = getattr(case_record, "complaint_id", None) if case_record else None
        officer_id = getattr(case_record, "assigned_officer_id", None) if case_record else None

        # 2. Generate file stream via DocumentEngine
        engine = DocumentEngine(db)
        output = engine.generate(
            case_id=request.case_id,
            document_type=request.document_type,
            language=request.language,
        )

        # 3. Upsert logic: Check if a row already exists for this case_id & document_type
        existing_doc = (
            db.query(Document)
            .filter(
                Document.case_id == request.case_id,
                Document.document_type == request.document_type,
            )
            .first()
        )

        formatted_title = request.document_type.replace("_", " ").title()

        if existing_doc:
            # Update the existing row
            existing_doc.status = "Pending Review"
            existing_doc.generated_by = officer_id or existing_doc.generated_by
            existing_doc.document_metadata = f"Language: {request.language}"
            existing_doc.updated_at = datetime.utcnow()
            doc_id = existing_doc.document_id
        else:
            # Create a new record if this document type hasn't been generated yet
            doc_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
            new_doc = Document(
                document_id=doc_id,
                case_id=request.case_id,
                complaint_id=complaint_id,
                document_type=request.document_type,
                title=f"{formatted_title} - Case #{request.case_id}",
                status="Pending Review",
                generated_by=officer_id,
                version="1.0",
                document_metadata=f"Language: {request.language}",
            )
            db.add(new_doc)

        db.commit()

        # 4. Stream docx back to client
        filename = f"{request.document_type}_{request.case_id}.docx"
        output.seek(0)

        return StreamingResponse(
            output,
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "X-Document-ID",
                "X-Document-ID": doc_id,
            },
        )

    except DocumentGenerationError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {e}")


@router.get("/case/{case_id}")
def get_documents_by_case(
    case_id: str,
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Document)
        .filter(Document.case_id == case_id)
        .order_by(Document.updated_at.desc())
        .all()
    )
    return {"documents": documents}


@router.patch("/{document_id}/status")
def update_document_status(
    document_id: str,
    payload: DocumentStatusUpdate,
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.document_id == document_id).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = payload.status
    doc.updated_at = datetime.utcnow()

    if payload.comments:
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        comment_entry = f"[{timestamp}] SHO ({payload.status}): {payload.comments}"
        existing_meta = doc.document_metadata or ""
        doc.document_metadata = f"{existing_meta}\n{comment_entry}".strip()

    db.commit()
    db.refresh(doc)

    return {
        "message": f"Document status updated to {payload.status}",
        "document": doc,
    }