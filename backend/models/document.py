from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from database.db import Base  # Adjust path to your Base import

class Document(Base):
    __tablename__ = "documents"

    document_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, nullable=True)
    complaint_id = Column(String, nullable=True)
    document_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    status = Column(String, default="Draft")
    generated_by = Column(String, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(String, nullable=True)
    document_metadata = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())