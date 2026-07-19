from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import ForeignKey

from database.db import Base


class Victim(Base):

    __tablename__ = "victims"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    victim_id = Column(
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

    age = Column(Integer)

    gender = Column(String(20))

    phone = Column(String(20))

    address = Column(Text)

    injuries = Column(Text)

    # =====================================================
    # PHOTO
    # =====================================================

    photo_url = Column(Text)

    photo_name = Column(Text)