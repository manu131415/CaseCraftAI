from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from database.db import Base


class Evidence(Base):

    __tablename__ = "evidences"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    evidence_id = Column(
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
    # FILE DETAILS
    # =====================================================

    evidence_type = Column(String(100))

    file_name = Column(String(255))

    file_type = Column(String(100))

    file_path = Column(Text)

    description = Column(Text)

    # =====================================================
    # OPTIONAL INVESTIGATION DETAILS
    # =====================================================

    serial_number = Column(String(200))

    quantity = Column(Integer)

    item_condition = Column(Text)

    seized_from = Column(String(255))

    seizure_datetime = Column(DateTime(timezone=True))

    seizure_location = Column(Text)

    seal_number = Column(String(100))

    storage_location = Column(Text)

    # =====================================================
    # CREATED
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )