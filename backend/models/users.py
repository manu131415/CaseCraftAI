"""
Domain models for CaseCraftAI auth.

Swap the in-memory pieces here for real SQLAlchemy models + a database
session once you wire up Postgres/MySQL. The shape (id, police_code, role,
hashed_password) is what auth.py depends on, so keep that contract.
"""

import re
from enum import Enum
from pydantic import BaseModel, EmailStr, field_validator


class Role(str, Enum):
    """The three roles CaseCraftAI supports today."""
    IO = "IO"                    # Investigating Officer
    SHO = "SHO"                  # Station House Officer
    LEGAL_ADVISOR = "LEGAL_ADVISOR"


# Mirrors the CHECK constraint in backend/sql/schema.sql — keeps a code
# from ever being issued for the wrong role, at the app layer too.
POLICE_CODE_PATTERN = {
    Role.IO: re.compile(r"^IO\d{4}$"),
    Role.SHO: re.compile(r"^SHO\d{4}$"),
    Role.LEGAL_ADVISOR: re.compile(r"^LA\d{4}$"),
}


class User(BaseModel):
    id: str
    name: str
    police_code: str             # login identifier, e.g. "IO3420"
    role: Role
    hashed_password: str
    email: EmailStr | None = None   # optional now — contact only, not login

    @field_validator("police_code")
    @classmethod
    def _uppercase(cls, v: str) -> str:
        return v.upper()