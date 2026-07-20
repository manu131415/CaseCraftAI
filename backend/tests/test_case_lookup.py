import unittest
from types import SimpleNamespace

from app.apis.cases import _resolve_complaint_reference
from models.complaint import Complaint


class QueryStub:
    def __init__(self, rows):
        self.rows = rows

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.rows[0] if self.rows else None


class DummyDB:
    def __init__(self, complaint=None):
        self.complaint = complaint

    def query(self, model):
        if model is Complaint:
            return QueryStub([self.complaint] if self.complaint else [])
        raise AssertionError(f"Unexpected model requested: {model}")


class CaseLookupTests(unittest.TestCase):
    def test_resolve_complaint_reference_accepts_complaint_number(self):
        complaint = SimpleNamespace(complaint_id="complaint-123", complaint_number="CMP-2026-000001")
        db = DummyDB(complaint)

        resolved = _resolve_complaint_reference(db, "CMP-2026-000001")

        self.assertIs(resolved, complaint)

    def test_resolve_complaint_reference_accepts_complaint_id(self):
        complaint = SimpleNamespace(complaint_id="complaint-123", complaint_number="CMP-2026-000001")
        db = DummyDB(complaint)

        resolved = _resolve_complaint_reference(db, "complaint-123")

        self.assertIs(resolved, complaint)


if __name__ == "__main__":
    unittest.main()
