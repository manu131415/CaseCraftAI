from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from app.services.doc_gen import generate_document_by_type, DATABASE_URL

router = APIRouter(prefix="/api/documents", tags=["Documents"])

class GenerateDocumentRequest(BaseModel):
    case_id: str
    document_type: str
    accused_id: str = None

@router.post("/generate")
def generate_document(request: GenerateDocumentRequest):
    try:
        result = generate_document_by_type(
            case_id=request.case_id,
            doc_type=request.document_type,
            accused_id=request.accused_id
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/case/{case_id}")
def get_documents_by_case(case_id: str):
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM documents WHERE case_id = %s ORDER BY generated_at DESC;", (case_id,))
        docs = cursor.fetchall()
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/download/{document_id}")
def download_document(document_id: str):
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM documents WHERE document_id = %s;", (document_id,))
        doc = cursor.fetchone()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Resolve full path
        # If relative (e.g. generated/name.docx), make it absolute
        file_path = doc['file_path']
        if not os.path.isabs(file_path):
            # assume relative to CaseCraftAI root
            base_dir = r"c:\Users\vyomi\OneDrive\Desktop\CaseCraftAI"
            file_path = os.path.join(base_dir, file_path)
            
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File not found on server at: {file_path}")
            
        filename = os.path.basename(file_path)
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
