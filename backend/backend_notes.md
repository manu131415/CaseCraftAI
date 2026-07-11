# Backend Implementation Notes

This document summarizes the current backend setup for CaseCraftAI as implemented in the FastAPI application under the backend package.

## Current stack

- FastAPI for the API layer
- SQLAlchemy ORM with declarative models
- PostgreSQL (Neon) as the database backend
- Alembic for migration management
- Pydantic models for request/response validation
- Python dotenv for environment configuration

## Project structure

- backend/app/main.py: FastAPI application entry point and router registration
- backend/app/apis/: API routers for complaints, cases, diaries, accused, victims, witnesses, medical reports, remand details, court custody, legal sections, recommendations, FIR drafts, and landmarks
- backend/models/: SQLAlchemy models for all application tables
- backend/database/db.py: SQLAlchemy engine, session factory, and Base metadata
- backend/alembic/: Alembic environment and migration revisions
- dataset/.env: runtime database connection string

## Current application models

The backend currently includes SQLAlchemy models for the following application tables:

- complaints
- officers
- cases
- documents
- evidences
- case_diaries
- accused
- victims
- witnesses
- medical_reports
- remand_details
- court_custody
- case_legal_sections
- legal_sections
- legal_section_mappings
- recommendations
- fir_drafts
- landmarks

## API surface

The FastAPI app exposes the following router groups:

- /api/complaints
- /api/cases
- /api/case-diary
- /api/accused
- /api/victims
- /api/witnesses
- /api/medical-reports
- /api/remand-details
- /api/court-custody
- /api/case-legal-sections
- /api/legal-sections
- /api/legal-section-mappings
- /api/recommendations
- /api/fir-drafts
- /api/landmarks
- /health

The health endpoint returns a simple status payload for service checks.

## Database and environment configuration

- The database connection string is loaded from dataset/.env.
- The SQLAlchemy engine is created in backend/database/db.py.
- The Alembic environment reads the same DATABASE_URL value and uses Base.metadata as target metadata.
- The current setup is validated against the live PostgreSQL database and the backend imports successfully.

## Alembic status

Alembic is configured and the migration chain is present in backend/alembic/versions.

Current revisions:

- 001: initial core case-management tables
- 002: legal sections and mappings
- 003: case management extensions
- 004: persons and medical records
- 005: custody and remand

The migration set currently targets application tables only and does not include Neon Auth tables.

## Validation notes

The backend was verified with the following checks:

- Successful import of the FastAPI app
- Successful Python compilation of the backend package
- Successful Alembic revision resolution via alembic heads
- Successful live database inspection against the configured PostgreSQL instance

## Notes for development

- Do not recreate existing models or routers unless a mismatch is confirmed.
- Keep endpoint URLs and request payloads stable unless schema changes require them.
- Use Alembic for future schema changes rather than manual SQL edits.
- When adding new tables or columns, update both the SQLAlchemy model and the matching migration revision.
```json
{
  "complainant_name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "crime_type": "Theft",
  "location": "Second Street",
  "description": "Updated description",
  "status": "In Progress"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Complaint updated successfully",
  "data": {
    "complaint_id": "uuid-1",
    "status": "In Progress",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Response (Not Found):**
```json
{
  "detail": "Complaint not found"
}
```

**SQLAlchemy Operations:**
- `db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()` - Find complaint
- Direct attribute assignment - SQLAlchemy tracks changes
- `db.commit()` - Persist changes
- `db.refresh()` - Get updated values

**Frontend Usage:**
- Edit complaint details from a form
- Update complaint status (Pending → In Progress → Closed)
- Correct information after initial submission

**Error Handling:**
- Returns 404 if complaint_id doesn't exist
- Returns 500 if update fails, with rollback
- Session always closed in finally block

---

#### DELETE /api/complaints/{complaint_id} (Delete Complaint)

**Purpose:**
Permanently remove a complaint from the database.

**Response (Success):**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```

**Response (Not Found):**
```json
{
  "detail": "Complaint not found"
}
```

**SQLAlchemy Operations:**
- `db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()` - Find complaint
- `db.delete(complaint)` - Mark for deletion
- `db.commit()` - Execute DELETE

**Frontend Usage:**
- Remove invalid/test complaints
- Delete complaints in error
- Clean up database (admin function)

**Error Handling:**
- Returns 404 if complaint_id doesn't exist
- Returns 500 if delete fails, with rollback
- Session always closed in finally block

**Note:** Hard delete. If complaint has linked cases, foreign key constraints may cause errors.

---

### ✔ Case CRUD APIs

#### POST /api/cases (Create Case)

**Purpose:**
Create a new Case from an existing Complaint. Typically done when a Complaint is accepted and an investigation is initiated.

**Request Body (CaseCreate Pydantic Model):**
```json
{
  "complaint_id": "uuid-string",
  "assigned_officer_id": "uuid-string",
  "case_number": "CASE-2024-001",
  "title": "Theft Investigation",
  "priority": "High",
  "description": "Investigation into reported theft"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Case created successfully",
  "data": {
    "case_id": "uuid-string",
    "status": "Open",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Response (Error - Invalid complaint_id):**
```json
{
  "detail": "Complaint not found"
}
```

**SQLAlchemy Operations:**
- Query Complaint to verify `complaint_id` exists
- Query Officer to verify `assigned_officer_id` exists (if provided)
- `db.add()` + `db.commit()` + `db.refresh()`

**Foreign Key Validation:**
- Must verify `complaint_id` exists in complaints table
- Must verify `assigned_officer_id` exists in officers table (if provided)
- Returns 404 if foreign key references don't exist

**Frontend Usage:**
- Officer accepts a Complaint and creates a Case
- System auto-creates Case when Complaint status changes to "Accepted"

---

#### GET /api/cases (Get All Cases)

**Purpose:**
Retrieve all cases for dashboard display, filtering, or officer assignment views.

**Response (Success):**
```json
{
  "cases": [
    {
      "case_id": "uuid-1",
      "complaint_id": "uuid-complaint",
      "assigned_officer_id": "uuid-officer",
      "case_number": "CASE-2024-001",
      "title": "Theft Investigation",
      "status": "Open",
      "priority": "High",
      "description": "Investigation into reported theft",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-02T00:00:00",
      "closed_at": null
    }
  ]
}
```

**SQLAlchemy Operations:**
- `db.query(Case).all()` - SELECT * FROM cases
- No commit needed (read-only)

**Frontend Usage:**
- Display case list in officer dashboard
- Filter cases by status (Open, Under Investigation, Closed)
- Filter cases by priority (High, Medium, Low)
- Show cases assigned to specific officer

**Error Handling:**
- Returns 500 if database query fails
- Returns empty array if no cases exist

---

#### GET /api/cases/{case_id} (Get Single Case)

**Purpose:**
Retrieve a specific case by ID for detailed view, editing, or to show related investigation data.

**Response (Success):**
```json
{
  "case_id": "uuid-1",
  "complaint_id": "uuid-complaint",
  "assigned_officer_id": "uuid-officer",
  "case_number": "CASE-2024-001",
  "title": "Theft Investigation",
  "status": "Open",
  "priority": "High",
  "description": "Investigation into reported theft",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-02T00:00:00",
  "closed_at": null
}
```

**Response (Not Found):**
```json
{
  "detail": "Case not found"
}
```

**SQLAlchemy Operations:**
- `db.query(Case).filter(Case.case_id == case_id).first()` - SELECT with WHERE clause
- No commit needed (read-only)

**Frontend Usage:**
- Display case details in case view
- Pre-populate edit form
- Show case information with related Evidence/Documents/CaseDiary

**Error Handling:**
- Returns 404 if case_id doesn't exist
- Returns 500 if database query fails

---

#### PUT /api/cases/{case_id} (Update Case)

**Purpose:**
Update editable fields of an existing case. Most frequently used endpoint as cases change throughout investigation.

**Immutable Fields:** `case_id`, `complaint_id`, `created_at`

**Editable Fields:** `assigned_officer_id`, `case_number`, `title`, `status`, `priority`, `description`, `closed_at`

**Request Body (CaseUpdate Pydantic Model):**
```json
{
  "assigned_officer_id": "uuid-new-officer",
  "status": "Under Investigation",
  "priority": "Medium",
  "description": "Updated investigation details"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "data": {
    "case_id": "uuid-1",
    "status": "Under Investigation",
    "updated_at": "2024-01-03T00:00:00"
  }
}
```

**Response (Not Found):**
```json
{
  "detail": "Case not found"
}
```

**Response (Error - Invalid officer_id):**
```json
{
  "detail": "Officer not found"
}
```

**SQLAlchemy Operations:**
- Query Case by ID
- Query Officer to verify `assigned_officer_id` exists (if being updated)
- Direct attribute assignment for non-None fields
- `db.commit()` + `db.refresh()`
- `db.rollback()` on error

**Foreign Key Validation:**
- If updating `assigned_officer_id`, must verify it exists in officers table
- Returns 404 if officer doesn't exist

**Frontend Usage:**
- Reassign case to different officer
- Update case status (Open → Under Investigation → Closed)
- Change priority based on developments
- Update case description with new information
- Set `closed_at` when closing case

**Error Handling:**
- Returns 404 if case_id doesn't exist
- Returns 404 if assigned_officer_id doesn't exist
- Returns 500 if update fails, with rollback
- Session always closed in finally block

---

#### DELETE /api/cases/{case_id} (Delete Case)

**Purpose:**
Delete a case. Can only delete if no dependent Evidence, Documents, or CaseDiary records exist.

**Current Project Handling:**
No cascade delete configured. Foreign key constraints prevent deletion if dependent records exist. Manual check performed before deletion.

**Response (Success):**
```json
{
  "success": true,
  "message": "Case deleted successfully"
}
```

**Response (Not Found):**
```json
{
  "detail": "Case not found"
}
```

**Response (Cannot Delete - Has Dependents):**
```json
{
  "detail": "Cannot delete case: Case has dependent records (2 Evidence, 1 Documents, 5 CaseDiary entries)"
}
```

**SQLAlchemy Operations:**
- Query Case by ID
- Query dependent entities (Evidence, Documents, CaseDiary)
- If no dependents: `db.delete(case)` + `db.commit()`
- `db.rollback()` on error

**Frontend Usage:**
- Remove invalid/test cases (only if no investigation data)
- Delete erroneously created cases (only if no investigation data)
- **Note:** Most cases with investigation data cannot be deleted

**Error Handling:**
- Returns 404 if case_id doesn't exist
- Returns 400 if case has dependent records (with counts)
- Returns 500 if delete fails, with rollback
- Session always closed in finally block

**Future Enhancement:**
- Implement cascade delete or soft delete for cases with dependents
- Add "archive" status instead of hard delete

---

### ✔ CaseDiary APIs

#### POST /api/case-diary (Create Diary Entry)

**Purpose:**
Create a new diary entry documenting an investigation action. Primary way to track investigation activities.

**Request Body (CaseDiaryCreate Pydantic Model):**
```json
{
  "case_id": "uuid-string",
  "officer_id": "uuid-string",
  "action_type": "Evidence Collected",
  "description": "Collected fingerprint samples from crime scene",
  "location": "123 Main Street",
  "occurred_at": "2024-01-01T10:30:00",
  "related_evidence_id": "uuid-evidence",
  "related_document_id": null
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Diary entry created successfully",
  "data": {
    "diary_id": "uuid-string",
    "created_at": "2024-01-01T10:35:00"
  }
}
```

**Response (Error - Invalid case_id):**
```json
{
  "detail": "Case not found"
}
```

**SQLAlchemy Operations:**
- Query Case to verify `case_id` exists
- Query Officer to verify `officer_id` exists
- Query Evidence to verify `related_evidence_id` exists (if provided)
- Query Document to verify `related_document_id` exists (if provided)
- `db.add()` + `db.commit()` + `db.refresh()`

**Foreign Key Validation:**
- Must verify `case_id` exists in cases table
- Must verify `officer_id` exists in officers table
- Must verify `related_evidence_id` exists in evidences table (if provided)
- Must verify `related_document_id` exists in documents table (if provided)
- Returns 404 if any foreign key reference doesn't exist

**Frontend Usage:**
- Auto-create entry when evidence is collected
- Auto-create entry when document is generated
- Manual entry for other investigation actions
- Track officer activities for accountability

---

#### GET /api/case-diary (Get All Diary Entries)

**Purpose:**
Retrieve all diary entries for audit review, timeline display, or investigation analysis.

**Response (Success):**
```json
{
  "diary_entries": [
    {
      "diary_id": "uuid-1",
      "case_id": "uuid-case",
      "officer_id": "uuid-officer",
      "action_type": "Case Opened",
      "description": "Investigation initiated",
      "location": "Police Station",
      "occurred_at": "2024-01-01T09:00:00",
      "created_at": "2024-01-01T09:05:00",
      "related_evidence_id": null,
      "related_document_id": null
    }
  ]
}
```

**SQLAlchemy Operations:**
- `db.query(CaseDiary).all()` - SELECT * FROM case_diaries
- No commit needed (read-only)

**Frontend Usage:**
- Display investigation timeline
- Show audit log for review
- Filter by case, officer, or action type
- Generate investigation reports

**Error Handling:**
- Returns 500 if database query fails
- Returns empty array if no entries exist

---

#### GET /api/case-diary/{diary_id} (Get Single Diary Entry)

**Purpose:**
Retrieve a specific diary entry by ID for detailed view or correction.

**Response (Success):**
```json
{
  "diary_id": "uuid-1",
  "case_id": "uuid-case",
  "officer_id": "uuid-officer",
  "action_type": "Evidence Collected",
  "description": "Collected fingerprint samples",
  "location": "123 Main Street",
  "occurred_at": "2024-01-01T10:30:00",
  "created_at": "2024-01-01T10:35:00",
  "related_evidence_id": "uuid-evidence",
  "related_document_id": null
}
```

**Response (Not Found):**
```json
{
  "detail": "Diary entry not found"
}
```

**SQLAlchemy Operations:**
- `db.query(CaseDiary).filter(CaseDiary.diary_id == diary_id).first()` - SELECT with WHERE clause
- No commit needed (read-only)

**Frontend Usage:**
- View specific diary entry details
- Pre-populate correction form
- Show entry in context of related evidence/document

**Error Handling:**
- Returns 404 if diary_id doesn't exist
- Returns 500 if database query fails

---

#### PUT /api/case-diary/{diary_id} (Update Diary Entry)

**Purpose:**
Update a diary entry for corrections (e.g., typo in description, wrong timestamp). Limited to factual corrections, not removing entries.

**Immutable Fields:** `diary_id`, `case_id`, `created_at`

**Editable Fields:** `officer_id`, `action_type`, `description`, `location`, `occurred_at`, `related_evidence_id`, `related_document_id`

**Request Body (CaseDiaryUpdate Pydantic Model):**
```json
{
  "description": "Collected fingerprint samples from door handle (corrected location)",
  "occurred_at": "2024-01-01T10:45:00"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Diary entry updated successfully",
  "data": {
    "diary_id": "uuid-1",
    "created_at": "2024-01-01T10:35:00"
  }
}
```

**Response (Not Found):**
```json
{
  "detail": "Diary entry not found"
}
```

**Response (Error - Invalid officer_id):**
```json
{
  "detail": "Officer not found"
}
```

**SQLAlchemy Operations:**
- Query CaseDiary by ID
- Query Officer to verify `officer_id` exists (if being updated)
- Query Evidence to verify `related_evidence_id` exists (if being updated)
- Query Document to verify `related_document_id` exists (if being updated)
- Direct attribute assignment for non-None fields
- `db.commit()` + `db.refresh()`
- `db.rollback()` on error

**Foreign Key Validation:**
- If updating `officer_id`, must verify it exists in officers table
- If updating `related_evidence_id`, must verify it exists in evidences table
- If updating `related_document_id`, must verify it exists in documents table
- Returns 404 if any reference doesn't exist

**Frontend Usage:**
- Correct factual errors in diary entries
- Update timestamps if initially recorded incorrectly
- Add missing links to evidence/documents
- **Note:** Should log correction metadata in production

**Error Handling:**
- Returns 404 if diary_id doesn't exist
- Returns 404 if any foreign key reference doesn't exist
- Returns 500 if update fails, with rollback
- Session always closed in finally block

**No DELETE Endpoint:**
CaseDiary is an investigation audit log. Entries should not be permanently removed for legal compliance, chain of custody requirements, and investigation integrity. Corrections are made via UPDATE only.

---

## Current Implementation Status

### Completed:
- ✅ All database models implemented
- ✅ Foreign key relationships established
- ✅ Coding style consistent across models
- ✅ Models follow existing project patterns
- ✅ Complaint submission API with database persistence
- ✅ Complaint CRUD APIs (GET all, GET single, PUT, DELETE)
- ✅ Case CRUD APIs (POST, GET all, GET single, PUT, DELETE)
- ✅ CaseDiary APIs (POST, GET all, GET single, PUT)

### Not Yet Implemented:
- ❌ Alembic migrations (using manual table creation)
- ❌ Database indexes (performance optimization)
- ❌ CRUD APIs for Documents
- ❌ Pydantic schemas for API validation
- ❌ Database seeding scripts

---

## Next Steps

1. Set up Alembic for database migrations
2. Create initial migration for existing schema
3. Implement CRUD APIs for Documents
4. Add database indexes for performance
5. Create OpenAPI/Swagger documentation
