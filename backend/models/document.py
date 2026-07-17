from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.sql import func

from database.db import Base


class Document(Base):

    __tablename__ = "documents"

    document_id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        String,
        ForeignKey("complaints.complaint_id"),
        nullable=False,
    )

    document_type = Column(String, nullable=False)

    title = Column(String, nullable=False)

    status = Column(
        String,
        default="Draft"
    )

    version = Column(
        Integer,
        default=1
    )

    content = Column(Text)

    generated_by = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )