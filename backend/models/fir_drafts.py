from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from database.db import Base


class FirDraft(Base):

    __tablename__ = "fir_drafts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    complaint_id = Column(UUID(as_uuid=True), nullable=False)

    crime_category = Column(Text)

    summary = Column(Text)

    draft_content = Column(JSONB, nullable=False, server_default='{}')

    status = Column(String, nullable=False, default="draft")

    officer_notes = Column(Text)

    approved_by = Column(String)

    approved_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('draft', 'under_review', 'approved')", name="fir_drafts_status_check"),
    )
