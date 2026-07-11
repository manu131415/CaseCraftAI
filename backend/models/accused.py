from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Date
from sqlalchemy import Integer
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database.db import Base


class Accused(Base):

    __tablename__ = "accused"

    accused_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    full_name = Column(String(255), nullable=False)

    alias = Column(String(255))

    father_name = Column(String(255))

    age = Column(Integer)

    dob = Column(Date)

    gender = Column(String(20))

    permanent_address = Column(Text)

    present_address = Column(Text)

    arrest_datetime = Column(DateTime(timezone=True))

    custody_status = Column(String(100))

    identification_marks = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    face_shape = Column(String(50))

    complexion = Column(String(50))

    eye_color = Column(String(50))

    eye_structure = Column(String(50))

    hair_type = Column(String(50))

    hair_color = Column(String(50))

    front_photo = Column(Text)

    left_profile_photo = Column(Text)

    right_profile_photo = Column(Text)

    capture_date = Column(Date)
