from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Boolean
from sqlalchemy import Integer
from sqlalchemy.sql import func

from database.db import Base


class Complaint(Base):
    __tablename__ = "complaints"

    # =====================================================
    # PRIMARY KEYS
    # =====================================================

    complaint_id = Column(String, primary_key=True)
    complaint_number = Column(String, unique=True, nullable=False)

    # =====================================================
    # COMPLAINT DETAILS
    # =====================================================

    complaint_title = Column(Text)

    crime_category = Column(String)
    crime_subcategory = Column(String)

    priority = Column(String, default="Medium")
    complaint_mode = Column(String)

    incident_date = Column(String)
    incident_time = Column(String)

    location = Column(Text)
    landmark = Column(Text)

    emergency = Column(String, default="No")

    description = Column(Text)

    ai_summary = Column(Text)
    officer_notes = Column(Text)

    # =====================================================
    # COMPLAINANT DETAILS
    # =====================================================

    complainant_name = Column(String(255))

    complainant_father_name = Column(String(255))

    complainant_age = Column(Integer, nullable=True)

    complainant_gender = Column(String(20))

    phone = Column(String(20))

    email = Column(String(255))

    complainant_address = Column(Text)

    complainant_aadhaar = Column(String(30))

    complainant_relationship = Column(String(100))

    complainant_occupation = Column(String(255))

    complainant_nationality = Column(String(100))

    complainant_photo_url = Column(Text)

    complainant_photo_name = Column(Text)

    # =====================================================
    # STATUS
    # =====================================================

    status = Column(
        String,
        default="Pending"
    )

    is_draft = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
