from unittest.mock import patch

from app.apis import complaints as complaints_module


class FakeSession:
    def __init__(self):
        self.added = []
        self.commits = 0

    def add(self, obj):
        self.added.append(obj)

    def flush(self):
        return None

    def commit(self):
        self.commits += 1


class FakeCase:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeCaseDiary:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


def test_create_case_and_timeline_artifacts_for_submitted_complaint():
    session = FakeSession()
    complaint = type(
        "ComplaintStub",
        (),
        {
            "complaint_id": "cmp-1",
            "complaint_number": "CMP-2025-000001",
            "complaint_title": "Theft report",
            "priority": "High",
            "description": "Theft at local market",
        },
    )()

    with patch.object(complaints_module, "Case", FakeCase), patch.object(complaints_module, "CaseDiary", FakeCaseDiary):
        case, diary_entries = complaints_module._create_case_and_timeline_artifacts(
            session,
            complaint,
            complaint.complaint_number,
            assigned_officer_id="officer-1",
        )

    assert case.complaint_id == complaint.complaint_id
    assert case.assigned_officer_id == "officer-1"
    assert case.priority == "High"
    assert len(diary_entries) == 2
    assert any(entry.action_type == "complaint_registered" for entry in diary_entries)
    assert any(entry.action_type == "case_created" for entry in diary_entries)
    assert session.commits == 1
