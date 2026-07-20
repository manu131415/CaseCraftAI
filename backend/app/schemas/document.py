from typing import Literal

from pydantic import BaseModel


class GenerateDocumentRequest(BaseModel):

    case_id: str

    document_type: Literal[
        "medical",
        "remand",
        "chargesheet",
        "purvani",
        "seizure",
        "panchnama",
        "custody",
        "face_identification",
    ]

    language: str = "en"