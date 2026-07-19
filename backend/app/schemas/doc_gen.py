# app/schemas/doc_gen.py

from typing import Literal

from pydantic import BaseModel


class GenerateDocumentRequest(BaseModel):

    case_id: str

    document_type: str

    language: Literal[
        "en",
        "hi",
        "gu",
    ] = "en"

    output: Literal[
        "docx",
        "pdf",
    ] = "docx"


class AvailableDocument(BaseModel):

    key: str

    title: str


class GenerateDocumentResponse(BaseModel):

    success: bool

    filename: str