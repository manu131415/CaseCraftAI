from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
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
        ForeignKey("officers.officer_id")
    )

    action_type = Column(String)

    description = Column(Text)

    location = Column(String)

    occurred_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    related_evidence_id = Column(
        String,
        ForeignKey("evidences.evidence_id")
    )

    related_document_id = Column(
        String,
        ForeignKey("documents.document_id")
    )
