from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Date
from sqlalchemy import Integer
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

    district = Column(String(100))

    police_station = Column(String(150))

    fir_no = Column(String(50))

    fir_year = Column(Integer)

    fir_date = Column(Date)

    incident_datetime = Column(DateTime(timezone=True))

    original_chargesheet_no = Column(String(50))

    original_chargesheet_date = Column(Date)

    supplementary_chargesheet_no = Column(String(50))

    supplementary_reason = Column(Text)

    court_name = Column(String(200))

    court_no = Column(String(50))

    current_stage = Column(String(100))
