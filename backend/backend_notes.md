# Backend Implementation Notes

This document provides an overview of the database schema and models implemented in the backend-db branch of CaseCraftAI.

---

## Implemented Models

### ✔ Complaint Model

**Purpose:**
Represents a citizen complaint submitted to the police system. This is the entry point for most cases in the system.

**Table:** `complaints`

**Key Fields:**
- `complaint_id` (String, PK) - Unique identifier for the complaint
- `complainant_name` (String) - Name of the person filing the complaint
- `phone` (String) - Contact phone number
- `email` (String) - Contact email address
- `crime_type` (String) - Type of crime reported
- `location` (Text) - Location where the incident occurred
- `description` (Text) - Detailed description of the incident
- `status` (String, default="Pending") - Current status of the complaint
- `created_at` (DateTime) - Timestamp when complaint was submitted

**Relationships:**
- Complaint → Case (One-to-Many: One complaint can lead to one or more cases)

---

### ✔ Officer Model

**Purpose:**
Represents police officers who are assigned to investigate cases and perform various actions in the system.

**Table:** `officers`

**Key Fields:**
- `officer_id` (String, PK) - Unique identifier for the officer
- `badge_number` (String) - Official badge number
- `name` (String) - Officer's full name
- `rank` (String) - Officer's rank/position
- `station` (String) - Police station where the officer is assigned

**Relationships:**
- Officer → Case (One-to-Many: One officer can handle multiple cases)
- Officer → Document (One-to-Many: One officer can generate multiple documents)
- Officer → CaseDiary (One-to-Many: One officer can create multiple diary entries)

---

### ✔ Evidence Model

**Purpose:**
Represents evidence collected during an investigation. Stores metadata about evidence files and links them to cases.

**Table:** `evidences`

**Key Fields:**
- `evidence_id` (String, PK) - Unique identifier for the evidence
- `case_id` (String, FK) - Links to the associated case
- `evidence_type` (String) - Type of evidence (photo, video, document, physical, etc.)
- `file_path` (String) - Storage location of the evidence file

**Relationships:**
- Case → Evidence (One-to-Many: One case can have multiple evidence items)
- Evidence → Case (Many-to-One: Multiple evidence items belong to one case)

---

### ✔ Case Model

**Purpose:**
Represents a police investigation case. This is the central entity that ties together complaints, evidence, documents, and investigation timeline.

**Table:** `cases`

**Key Fields:**
- `case_id` (String, PK) - Unique identifier for the case
- `complaint_id` (String, FK) - Links to the originating complaint
- `assigned_officer_id` (String, FK) - Officer assigned to investigate
- `case_number` (String) - Official case number from police station
- `title` (String) - Brief title/summary of the case
- `status` (String, default="Open") - Current case status (Open, Under Investigation, Closed, Archived)
- `priority` (String) - Priority level (Low, Medium, High, Critical)
- `description` (Text) - Detailed case description/notes
- `created_at` (DateTime) - Timestamp when case was created
- `updated_at` (DateTime) - Timestamp when case was last modified
- `closed_at` (DateTime) - Timestamp when case was closed (nullable)

**Relationships:**
- Complaint → Case (One-to-Many: One complaint can lead to multiple cases)
- Case → Evidence (One-to-Many: One case can have multiple evidence items)
- Case → Documents (One-to-Many: One case can have multiple documents)
- Case → CaseDiary (One-to-Many: One case can have multiple diary entries)
- Officer → Case (One-to-Many: One officer can handle multiple cases)

---

### ✔ Document Model

**Purpose:**
Represents police documents generated during an investigation (e.g., Seizure Receipt, Medical Treatment Letter, Remand Request, Accused Panchanama). Stores metadata only, not actual document contents.

**Table:** `documents`

**Key Fields:**
- `document_id` (String, PK) - Unique identifier for the document
- `case_id` (String, FK) - Links to the associated case
- `document_type` (String) - Type of document (Seizure Receipt, Medical Treatment Letter, etc.)
- `title` (String) - Human-readable title for the document
- `file_path` (String) - Storage location of the generated document
- `status` (String, default="Draft") - Document status (Draft, Generated, Signed, Submitted, Archived)
- `generated_by` (String, FK) - Officer who requested/generated the document
- `generated_at` (DateTime) - Timestamp when document was created
- `version` (String) - Document version for tracking revisions
- `document_metadata` (Text) - JSON string for extensible document-specific data

**Relationships:**
- Case → Documents (One-to-Many: One case can have multiple documents)
- Officer → Document (One-to-Many: One officer can generate multiple documents)

---

### ✔ CaseDiary Model

**Purpose:**
Represents investigation timeline entries. Each entry documents an action taken during the investigation (e.g., Complaint registered, Crime scene visited, Evidence collected, Witness statement recorded, Accused arrested, Documents generated).

**Table:** `case_diaries`

**Key Fields:**
- `diary_id` (String, PK) - Unique identifier for the diary entry
- `case_id` (String, FK) - Links to the associated case
- `officer_id` (String, FK) - Officer who performed the action
- `action_type` (String) - Type of action performed
- `description` (Text) - Detailed description of the action
- `location` (String) - Location where the action occurred
- `occurred_at` (DateTime) - Timestamp when the action actually occurred
- `created_at` (DateTime) - Timestamp when the diary entry was logged
- `related_evidence_id` (String, FK) - Optional link to related evidence
- `related_document_id` (String, FK) - Optional link to related document

**Relationships:**
- Case → CaseDiary (One-to-Many: One case can have multiple diary entries)
- Officer → CaseDiary (One-to-Many: One officer can create multiple diary entries)
- Evidence → CaseDiary (One-to-Many: One evidence can be referenced in multiple diary entries)
- Document → CaseDiary (One-to-Many: One document can be referenced in multiple diary entries)

---

## Complete Schema Relationships

```
Complaint → Case → Evidence
                ↓
              Documents
                ↓
              CaseDiary
                ↓
              Officer
```

**Flow Explanation:**
1. A **Complaint** is submitted by a citizen
2. A **Case** is created from the complaint
3. An **Officer** is assigned to investigate the case
4. **Evidence** is collected and linked to the case
5. **Documents** are generated for the case
6. **CaseDiary** entries track all investigation actions

---

## Database Connection

**Database:** PostgreSQL (Neon Cloud)
**Connection String:** Stored in `dataset/local.env`
**ORM:** SQLAlchemy (Declarative Base pattern)
**Session Management:** Manual commit/flush via `SessionLocal`

---

## Alembic Migration Workflow

### Manual migration setup

The backend now includes a manual Alembic migration workflow for the core case-management tables.

**Initialization:**
- Run `python -m alembic init alembic` once in the backend directory.
- Keep the generated Alembic scaffold intact except for the environment file.

**Environment configuration:**
- Update [backend/alembic/env.py](backend/alembic/env.py) so Alembic:
  - imports `Base` from `database.db`
  - imports all SQLAlchemy models via `import models`
  - sets `target_metadata = Base.metadata`
  - reads `DATABASE_URL` exactly like [backend/database/db.py](backend/database/db.py)
  - overrides `config.set_main_option("sqlalchemy.url", DATABASE_URL)`

**Manual migration file:**
- Create a migration file at [backend/alembic/versions/001_case_management.py](backend/alembic/versions/001_case_management.py).
- Use `op.create_table()` only for the tables `cases`, `evidences`, and `case_diaries`.
- Reference existing tables only through foreign keys.
- Keep the downgrade path limited to dropping `case_diaries`, `evidences`, and `cases` in reverse order.

**Useful commands:**
- `python -m alembic revision --autogenerate -m "Initial schema"`
- `python -m alembic upgrade head`
- `python -m alembic downgrade -1`

---

## OpenAPI and API Documentation Improvements

### ✅ FastAPI documentation enhancement completed

The backend API layer was updated to improve OpenAPI generation without changing runtime behavior.

**What was added:**
- Explicit Pydantic response schemas for complaint, case, and case-diary endpoints
- Endpoint-level `summary` and `description` metadata for clearer API docs
- `tags` metadata to group endpoints logically in Swagger/ReDoc
- FastAPI app metadata such as the API title and description
- Documentation for the health endpoint

**Scope of change:**
- Only documentation and schema metadata were added
- Existing request payloads, database queries, transaction handling, and business logic were preserved
- No SQLAlchemy models were modified

**Result:**
- Swagger/OpenAPI output is now more complete and descriptive for frontend and API consumers

---

## Implemented APIs

### ✔ Complaint Submission API

**Endpoint:** `POST /api/complaints/submit`

**Purpose:**
Accepts complaint submissions from the frontend and persists them to the PostgreSQL database.

**Request Body (ComplaintSubmission Pydantic Model):**
- `complaintType` (str) - Type of crime/complaint
- `category` (str) - Complaint category
- `priority` (str) - Priority level
- `incidentDate` (str) - Date of incident
- `incidentTime` (str) - Time of incident
- `location` (str) - Location of incident
- `description` (str) - Detailed description
- `aiSummary` (str) - AI-generated summary
- `officerNotes` (str) - Officer notes
- `complainants` (List[Dict]) - List of complainant information
- `victims` (List[Dict]) - List of victim information
- `suspects` (List[Dict]) - List of suspect information
- `attachments` (List[Dict]) - List of attachment information

**Response (Success):**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaint_id": "uuid-string",
    "status": "Pending",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**Response (Error):**
```json
{
  "detail": "Failed to submit complaint: error details"
}
```

**Database Flow:**
1. Pydantic validates request payload
2. SQLAlchemy session created via `SessionLocal()`
3. Complaint model instance created with field mapping:
   - `complaintType` → `crime_type`
   - `complainants[0].name` → `complainant_name`
   - `complainants[0].phone` → `phone`
   - `complainants[0].email` → `email`
   - `location` → `location`
   - `description` → `description`
   - `status` → "Pending"
   - `complaint_id` → Generated via `uuid.uuid4()`
   - `created_at` → Auto-generated by PostgreSQL
4. `db.add()` adds complaint to session
5. `db.commit()` persists to PostgreSQL
6. `db.refresh()` retrieves generated values
7. Session closed in `finally` block
8. On error: `db.rollback()` and HTTP 500 response

**Error Handling:**
- Database errors trigger rollback and HTTP 500
- Session always closed to prevent connection leaks
- Detailed error messages returned for debugging

---

### ✔ Complaint CRUD APIs

#### GET /api/complaints (Get All Complaints)

**Purpose:**
Retrieve all complaints from the database for listing/display purposes.

**Response (Success):**
```json
{
  "complaints": [
    {
      "complaint_id": "uuid-1",
      "complainant_name": "John Doe",
      "phone": "1234567890",
      "email": "john@example.com",
      "crime_type": "Theft",
      "location": "Main Street",
      "description": "Item stolen",
      "status": "Pending",
      "created_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**SQLAlchemy Operations:**
- `db.query(Complaint).all()` - SELECT * FROM complaints
- No commit needed (read-only)

**Frontend Usage:**
- Display complaint list in dashboard
- Filter/search through complaints
- Show overview of all submitted complaints

**Error Handling:**
- Returns 500 if database query fails
- Returns empty array if no complaints exist

---

#### GET /api/complaints/{complaint_id} (Get Single Complaint)

**Purpose:**
Retrieve a specific complaint by its ID for detailed view or editing.

**Response (Success):**
```json
{
  "complaint_id": "uuid-1",
  "complainant_name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "crime_type": "Theft",
  "location": "Main Street",
  "description": "Item stolen",
  "status": "Pending",
  "created_at": "2024-01-01T00:00:00"
}
```

**Response (Not Found):**
```json
{
  "detail": "Complaint not found"
}
```

**SQLAlchemy Operations:**
- `db.query(Complaint).filter(Complaint.complaint_id == complaint_id).first()` - SELECT with WHERE clause
- No commit needed (read-only)

**Frontend Usage:**
- Display complaint details in a form
- Pre-populate edit form with existing data
- Show complaint information in case view

**Error Handling:**
- Returns 404 if complaint_id doesn't exist
- Returns 500 if database query fails

---

#### PUT /api/complaints/{complaint_id} (Update Complaint)

**Purpose:**
Update editable fields of an existing complaint while preserving immutable fields.

**Immutable Fields:** `complaint_id`, `created_at`

**Editable Fields:** `complainant_name`, `phone`, `email`, `crime_type`, `location`, `description`, `status`

**Request Body (ComplaintUpdate Pydantic Model):**
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
