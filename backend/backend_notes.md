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

## Current Implementation Status

### Completed:
- ✅ All database models implemented
- ✅ Foreign key relationships established
- ✅ Coding style consistent across models
- ✅ Models follow existing project patterns
- ✅ Complaint submission API with database persistence

### Not Yet Implemented:
- ❌ Alembic migrations (using manual table creation)
- ❌ Database indexes (performance optimization)
- ❌ CRUD APIs for Cases, Documents, CaseDiary
- ❌ Update/Delete operations for Complaints
- ❌ Pydantic schemas for API validation
- ❌ Database seeding scripts

---

## Next Steps

1. Set up Alembic for database migrations
2. Create initial migration for existing schema
3. Implement CRUD APIs for Complaints
4. Implement CRUD APIs for Cases
5. Implement CRUD APIs for Documents
6. Implement CRUD APIs for CaseDiary
7. Add database indexes for performance
8. Create OpenAPI/Swagger documentation
