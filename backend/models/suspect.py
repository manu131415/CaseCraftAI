from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Boolean
from sqlalchemy import Date
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from database.db import Base


class Suspects(Base):

    __tablename__ = "suspects"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    suspect_id = Column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    # =====================================================
    # FOREIGN KEY
    # =====================================================

    complaint_id = Column(
        String,
        ForeignKey("complaints.complaint_id"),
        nullable=False
    )

    # =====================================================
    # PERSONAL DETAILS
    # =====================================================

    full_name = Column(String(255))

    alias = Column(String(255))

    father_name = Column(String(255))

    age = Column(Integer)

    dob = Column(Date)

    gender = Column(String(20))

    unknown_identity = Column(
        Boolean,
        default=False
    )

    # =====================================================
    # ADDRESS
    # =====================================================

    permanent_address = Column(Text)

    present_address = Column(Text)

    # =====================================================
    # PHYSICAL FEATURES
    # =====================================================

    identification_marks = Column(Text)

    face_shape = Column(String(50))

    complexion = Column(String(50))

    eye_color = Column(String(50))

    eye_structure = Column(String(50))

    hair_type = Column(String(50))

    hair_color = Column(String(50))

    # =====================================================
    # PHOTO
    # =====================================================

    photo_url = Column(Text)

    photo_name = Column(Text)

    # =====================================================
    # ARREST DETAILS
    # =====================================================

    arrest_datetime = Column(
        DateTime(timezone=True)
    )

    custody_status = Column(String(100))

    capture_date = Column(Date)

    # =====================================================
    # CREATED
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )