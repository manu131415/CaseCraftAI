from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import ForeignKey

from database.db import Base


class Evidence(Base):

    __tablename__ = "evidences"

    evidence_id = Column(String, primary_key=True)

    case_id = Column(
        String,
        ForeignKey("cases.case_id")
    )

    evidence_type = Column(String)

    file_path = Column(String)

    description = Column(Text)

    serial_number = Column(String(200))

    quantity = Column(Integer, default=1)

    item_condition = Column(Text)

    seized_from = Column(String(255))

    seizure_datetime = Column(DateTime(timezone=True))

    seizure_location = Column(Text)

    seal_number = Column(String(100))

    storage_location = Column(Text)