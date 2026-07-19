from sqlalchemy import Column, String, Text, Integer, DateTime, func
from database.db import Base


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(String, primary_key=True)
    complaint_number = Column(String(20), unique=True, nullable=True)
    complaint_title = Column(Text, nullable=True)
    complaint_mode = Column(String(100), nullable=True)

    complainant_name = Column(String, nullable=True)
    complainant_father_name = Column(String(255), nullable=True)
    complainant_address = Column(Text, nullable=True)
    complainant_age = Column(Integer, nullable=True)
    complainant_gender = Column(String(20), nullable=True)
    complainant_aadhaar = Column(String(30), nullable=True)
    complainant_relationship = Column(String(100), nullable=True)
    complainant_occupation = Column(String(255), nullable=True)
    complainant_nationality = Column(String(100), nullable=True)
    complainant_photo_url = Column(Text, nullable=True)
    complainant_photo_name = Column(Text, nullable=True)

    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    crime_category = Column(String(255), nullable=True)
    crime_subcategory = Column(String(255), nullable=True)
    priority = Column(String(100), nullable=True)
    incident_date = Column(String(100), nullable=True)
    incident_time = Column(String(100), nullable=True)
    incident_datetime = Column(DateTime(timezone=True), nullable=True)
    incident_location = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    landmark = Column(Text, nullable=True)
    emergency = Column(String(20), nullable=True)

    description = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    officer_notes = Column(Text, nullable=True)

    status = Column(String, nullable=False, server_default="Pending")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())