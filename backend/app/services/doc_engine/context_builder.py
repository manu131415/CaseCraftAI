from datetime import datetime


class ContextBuilder:
    """
    Converts fetched SQLAlchemy models into a plain dictionary
    suitable for docxtpl rendering.
    """

    @staticmethod
    def _to_dict(obj):
        """
        Convert SQLAlchemy model to dictionary.
        """

        if obj is None:
            return {}

        data = {}

        for column in obj.__table__.columns:
            value = getattr(obj, column.name)

            # Convert datetime/date/time to string
            if isinstance(value, (datetime,)):
                value = value.strftime("%d-%m-%Y %H:%M:%S")

            data[column.name] = value

        return data

    @classmethod
    def build(cls, data: dict) -> dict:
        """
        Build rendering context for docxtpl.
        """

        context = {
            "generated_at": datetime.now().strftime("%d-%m-%Y"),
            "generated_time": datetime.now().strftime("%H:%M:%S"),

            "case": cls._to_dict(data["case"]),

            "complaint": cls._to_dict(data["complaint"]),

            "officer": cls._to_dict(data["officer"]),

            "victims": [
                cls._to_dict(v)
                for v in data["victims"]
            ],

            "suspects": [
                cls._to_dict(s)
                for s in data["suspects"]
            ],

            "documents": [
                cls._to_dict(d)
                for d in data["documents"]
            ],

            "evidences": [
                cls._to_dict(e)
                for e in data["evidences"]
            ],

            "case_diaries": [
                cls._to_dict(cd)
                for cd in data["case_diaries"]
            ],
        }

        return context