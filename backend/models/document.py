from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from database.db import Base


class Document(Base):

    __tablename__ = "documents"

    document_id = Column(String, primary_key=True)

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    document_type = Column(String)

    title = Column(String)

    file_path = Column(String)

    status = Column(String, default="Draft")

    generated_by = Column(
        String,
        ForeignKey("officers.officer_id")
    )

    generated_at = Column(DateTime(timezone=True), server_default=func.now())

    version = Column(String)

    document_metadata = Column(Text)
