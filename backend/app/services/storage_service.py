from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4
from io import BytesIO


class DocumentStorageService:
    """
    Saves generated DOCX files.

    Later this can be replaced with
    Cloudinary
    AWS S3
    Azure Blob
    MinIO
    """

    BASE_DIR = Path("generated_documents")

    def __init__(self):
        self.BASE_DIR.mkdir(exist_ok=True)

    def save(
        self,
        output: BytesIO,
        case_id: str,
        document_type: str,
    ):

        folder = self.BASE_DIR / case_id

        folder.mkdir(exist_ok=True)

        filename = (
            f"{document_type}_{uuid4().hex}.docx"
        )

        filepath = folder / filename

        with open(filepath, "wb") as f:
            f.write(output.getvalue())

        return {
            "filename": filename,
            "filepath": str(filepath),
        }