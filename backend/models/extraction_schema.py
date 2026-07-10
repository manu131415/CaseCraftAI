from pydantic import BaseModel
from typing import List


class Person(BaseModel):
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
    priority: str = ""

    incidentDate: str = ""
    incidentTime: str = ""

    location: str = ""

    description: str = ""

    aiSummary: str = ""

    officerNotes: str = ""

    complainants: List[Person] = []

    victims: List[Victim] = []

    suspects: List[Suspect] = []