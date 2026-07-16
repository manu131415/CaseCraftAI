from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class CaseLegalSection(Base):

    __tablename__ = "case_legal_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    legal_section_id = Column(
        UUID(as_uuid=True),
        ForeignKey("legal_sections.id")
    )
