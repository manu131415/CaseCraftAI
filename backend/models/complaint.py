from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Date
from sqlalchemy.sql import func

from database.db import Base


class Complaint(Base):

    __tablename__ = "complaints"

    complaint_id = Column(String, primary_key=True)
    complaint_number = Column(String, unique=True, nullable=False)
    complainant_name = Column(String)
    phone = Column(String)
    email = Column(String)
    crime_category = Column(String, nullable=True)
    crime_subcategory = Column(String, nullable=True)
    priority = Column(String)
    incident_date = Column(String)
    incident_time = Column(String)
    location = Column(Text)
    description = Column(Text)
    ai_summary = Column(Text)
    officer_notes = Column(Text)
    complainant_data = Column(Text)
    victim_data = Column(Text)
    suspect_data = Column(Text)
    attachment_data = Column(Text)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    complainant_father_name = Column(String(255))
    complainant_address = Column(Text)
    incident_datetime = Column(DateTime(timezone=True))
    incident_location = Column(Text)
    address = Column(Text)