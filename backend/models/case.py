from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from database.db import Base


class Case(Base):

    __tablename__ = "cases"

    case_id = Column(String, primary_key=True)

    complaint_id = Column(
        String,
        ForeignKey("complaints.complaint_id")
    )

    assigned_officer_id = Column(
        String,
        ForeignKey("officers.officer_id")
    )

    case_number = Column(String)

    title = Column(String)

    status = Column(String, default="Open")

    priority = Column(String)

    description = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    closed_at = Column(DateTime(timezone=True))
