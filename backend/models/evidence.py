from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from database.db import Base


class Evidence(Base):

    __tablename__ = "evidences"

    evidence_id = Column(String, primary_key=True)

    complaint_id = Column(
        String,
        ForeignKey("complaints.complaint_id")
    )

    evidence_type = Column(String)

    file_name = Column(String)

    file_path = Column(Text)

    extracted_text = Column(Text)

    summary = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())