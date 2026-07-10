from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy.sql import func

from database.db import Base


class Complaint(Base):

    __tablename__ = "complaints"

    complaint_id = Column(String, primary_key=True)

    complainant_name = Column(String)

    phone = Column(String)

    email = Column(String)

    crime_type = Column(String)

    complaint_type = Column(String)

    category = Column(String)

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