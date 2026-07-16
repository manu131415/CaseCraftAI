from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class Recommendation(Base):

    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    complaint_id = Column(UUID(as_uuid=True), nullable=False)

    legal_section_id = Column(UUID(as_uuid=True), nullable=False)

    similarity_score = Column(Float)

    confidence = Column(String)

    reasoning = Column(Text)

    officer_decision = Column(String, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("confidence IN ('low', 'medium', 'high')", name="recommendations_confidence_check"),
        CheckConstraint("officer_decision IN ('pending', 'accepted', 'rejected')", name="recommendations_officer_decision_check"),
    )
