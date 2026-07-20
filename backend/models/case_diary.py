from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import JSON
from sqlalchemy.sql import func

from database.db import Base


class CaseDiary(Base):

    __tablename__ = "case_diaries"

    diary_id = Column(String, primary_key=True)

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    officer_id = Column(
        String,
        ForeignKey("officers.officer_id"),
        nullable=True
    )

    action_type = Column(String)

    description = Column(Text)

    location = Column(String, nullable=True)

    occurred_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    related_evidence_id = Column(
        String,
        ForeignKey("evidences.evidence_id"),
        nullable=True
    )

    related_document_id = Column(
        String,
        ForeignKey("documents.document_id"),
        nullable=True
    )

    remarks = Column(Text, nullable=True)

    next_action = Column(Text, nullable=True)

    attachments = Column(JSON, nullable=True, default=[])

