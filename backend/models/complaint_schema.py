from typing import List
from pydantic import BaseModel, Field


class Complainant(BaseModel):
    name: str = ""
    contact: str = ""
    relationship: str = ""
    statement: str = ""


class Victim(BaseModel):
    type: str = ""
    name: str = ""
    contact: str = ""
    statement: str = ""


class Suspect(BaseModel):
    type: str = ""
    name: str = ""
    contact: str = ""
    description: str = ""
    status: str = ""


class ComplaintExtraction(BaseModel):

    complaintType: str = ""

    category: str = ""

    priority: str = "Medium"

    incidentDate: str = ""

    incidentTime: str = ""

    location: str = ""

    description: str = ""

    aiSummary: str = ""

    officerNotes: str = ""

    complainants: List[Complainant] = Field(default_factory=list)

    victims: List[Victim] = Field(default_factory=list)

    suspects: List[Suspect] = Field(default_factory=list)