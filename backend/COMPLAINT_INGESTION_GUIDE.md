# Complaint Ingestion - Data Model Changes & API Updates

## Summary of Changes (2026-07-19)

The complaint data model has been refactored from storing JSON data within the complaint record to using separate relational tables for victims, suspects, and evidence. This document outlines the changes and how to use the new system.

## Model Structure Changes

### Before
```
Complaint (single table)
├── victim_data (JSON field)
├── suspect_data (JSON field)
├── attachment_data (JSON field)
└── ...other fields
```

### After
```
Complaint (table)
├── victims (foreign key relationship)
├── suspects (foreign key relationship)
├── evidence (foreign key relationship)
└── documents (foreign key relationship)
```

## Database Changes

### New/Updated Columns

1. **complaints.is_draft** (Boolean, default=True)
   - Tracks whether a complaint is in draft or submitted status
   - Migration: `007_add_is_draft_to_complaints.py`

### Updated Models

All models now use proper foreign keys instead of JSON storage:

- **Victim** - Foreign key: `complaint_id`
- **Suspects** - Foreign key: `complaint_id`
- **Evidence** - Foreign key: `complaint_id`
- **Document** - Foreign key: `complaint_id`

## API Endpoints

### 1. Submit Complaint (Final Submission)

**POST** `/api/complaints/submit`

Creates a complete complaint record with all related data in a single transaction.

**Request:**
```json
{
  "complaint": {
    "complaintTitle": "Street Harassment",
    "crimeCategory": "Assault",
    "crimeSubcategory": "Verbal Abuse",
    "priority": "High",
    "complaintMode": "Online",
    "incidentDate": "2026-07-19",
    "incidentTime": "14:30",
    "location": "Main Street",
    "landmark": "Near Market",
    "emergency": "No",
    "description": "Incident details here...",
    "officerNotes": "Initial assessment...",
    "complainantName": "John Doe",
    "complainantFatherName": "James Doe",
    "complainantAge": "35",
    "complainantGender": "Male",
    "complainantPhone": "9876543210",
    "complainantEmail": "john@example.com",
    "complainantAddress": "123 Main St",
    "complainantAadhaar": "1234567890123456",
    "complainantRelationship": "Self",
    "complainantOccupation": "Engineer",
    "complainantNationality": "Indian"
  },
  "victims": [
    {
      "fullName": "Jane Smith",
      "age": "28",
      "gender": "Female",
      "phone": "9876543211",
      "address": "456 Oak Ave",
      "injuries": "Minor scratches",
      "photoUrl": "https://...",
      "photoName": "victim_photo.jpg"
    }
  ],
  "suspects": [
    {
      "fullName": "Unknown Male",
      "alias": "Red Shirt Guy",
      "fatherName": "",
      "age": "40",
      "dob": "1986-07-19",
      "gender": "Male",
      "permanentAddress": "",
      "presentAddress": "Location of incident",
      "identificationMarks": "Tattoo on left arm",
      "faceShape": "Oval",
      "complexion": "Fair",
      "eyeColor": "Brown",
      "eyeStructure": "Normal",
      "hairType": "Straight",
      "hairColor": "Black",
      "unknownIdentity": false,
      "photoUrl": "https://...",
      "photoName": "suspect_photo.jpg"
    }
  ],
  "attachments": [
    {
      "id": "doc-1",
      "fileName": "FIR_document.pdf",
      "fileType": "application/pdf",
      "documentUrl": "https://cloudinary.../fir.pdf"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaint_id": "uuid-xxx",
    "complaint_number": "CMP-2026-000001",
    "status": "Submitted",
    "is_draft": false,
    "created_at": "2026-07-19T14:30:00"
  }
}
```

### 2. Save as Draft

**POST** `/api/complaints/save-draft`

Create or update a complaint as draft without final submission. Allows users to save progress and continue later.

**Request:** (Same structure as submit endpoint)

**Response (Success):**
```json
{
  "success": true,
  "message": "Complaint saved as draft successfully",
  "data": {
    "complaint_id": "uuid-yyy",
    "complaint_number": "CMP-2026-000002",
    "status": "Draft",
    "is_draft": true,
    "created_at": "2026-07-19T14:30:00"
  }
}
```

### 3. Get Complaint Details

**GET** `/api/complaints/{complaint_id}`

Retrieves a complaint with all related victims, suspects, and documents.

**Response:**
```json
{
  "complaint_id": "uuid-xxx",
  "complaint_number": "CMP-2026-000001",
  "complainant_name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "crime_category": "Assault",
  "crime_subcategory": "Verbal Abuse",
  "location": "Main Street",
  "description": "Incident details...",
  "status": "Submitted",
  "is_draft": false,
  "created_at": "2026-07-19T14:30:00",
  "victims": [
    {
      "victim_id": 1,
      "complaint_id": "uuid-xxx",
      "fullName": "Jane Smith",
      "age": 28,
      "gender": "Female",
      "phone": "9876543211",
      "address": "456 Oak Ave",
      "injuries": "Minor scratches",
      "photoUrl": "https://...",
      "photoName": "victim_photo.jpg"
    }
  ],
  "suspects": [
    {
      "suspect_id": 1,
      "complaint_id": "uuid-xxx",
      "fullName": "Unknown Male",
      "alias": "Red Shirt Guy",
      "age": 40,
      "gender": "Male",
      "unknownIdentity": false,
      "photoUrl": "https://...",
      "photoName": "suspect_photo.jpg"
    }
  ],
  "documents": [
    {
      "document_id": "doc-1",
      "complaint_id": "uuid-xxx",
      "fileName": "FIR_document.pdf",
      "fileType": "application/pdf",
      "filePath": "https://cloudinary.../fir.pdf",
      "cloudinaryUrl": "https://cloudinary.../fir.pdf",
      "extractedData": {}
    }
  ]
}
```

### 4. List All Complaints

**GET** `/api/complaints`

Returns a list of all complaints with summary information.

**Response:**
```json
{
  "complaints": [
    {
      "complaint_id": "uuid-xxx",
      "complaint_number": "CMP-2026-000001",
      "complainant_name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "crime_category": "Assault",
      "status": "Submitted",
      "is_draft": false,
      "created_at": "2026-07-19T14:30:00"
    }
  ]
}
```

### 5. Update Complaint

**PUT** `/api/complaints/{complaint_id}`

Update specific fields of a complaint.

**Request:**
```json
{
  "status": "In Progress",
  "description": "Updated description",
  "officer_notes": "Investigation ongoing..."
}
```

### 6. Delete Complaint

**DELETE** `/api/complaints/{complaint_id}`

Removes complaint and all related records (victims, suspects, evidence, documents).

## Frontend Integration

### ComplaintWizard Component

The complaint registration form now includes:

1. **Save Draft Button** - Available on all steps
   - Saves current form state to database
   - Returns `complaint_id` for future updates
   - Status set to "Draft"
   - `is_draft = true`

2. **Submit Button** - Available on final review step
   - Submits complete complaint
   - Creates all related records
   - Status set to "Submitted"
   - `is_draft = false`

### Usage Example

```typescript
// Save as draft
async function handleSaveDraft() {
  const response = await axios.post(
    `${API_BASE}/api/complaints/save-draft`,
    {
      complaint: form,
      victims,
      suspects,
      attachments,
    }
  );
  // response.data.data.complaint_id can be stored to update later
}

// Submit final complaint
async function handleSubmit() {
  const response = await axios.post(
    `${API_BASE}/api/complaints/submit`,
    {
      complaint: form,
      victims,
      suspects,
      attachments,
    }
  );
  // Complaint is now submitted and stored in database
}
```

## Database Migration

To apply the database changes:

```bash
# From backend directory
alembic upgrade head
```

This will add the `is_draft` column to the complaints table.

## Data Flow

### Complaint Registration Flow

```
1. User fills complaint form
   ↓
2. User clicks "Save Draft"
   ├─ POST /api/complaints/save-draft
   ├─ Creates Complaint (is_draft=true, status="Draft")
   ├─ Creates Victim records
   ├─ Creates Suspect records
   └─ Returns complaint_id
   
3. User continues editing and clicks "Submit"
   ├─ POST /api/complaints/submit
   ├─ Creates new Complaint (is_draft=false, status="Submitted")
   ├─ Creates all related records
   └─ Investigation can now begin
```

### Data Retrieval Flow

```
GET /api/complaints/{complaint_id}
├─ Query Complaint table
├─ Query Victim table (WHERE complaint_id = ...)
├─ Query Suspects table (WHERE complaint_id = ...)
├─ Query Document table (WHERE complaint_id = ...)
└─ Return combined JSON response
```

## Benefits of New Structure

1. **Relational Integrity** - Foreign keys ensure data consistency
2. **Query Flexibility** - Can easily filter/search by victims, suspects, etc.
3. **Draft Support** - Users can save progress without final submission
4. **Scalability** - Adding more fields to victims/suspects is straightforward
5. **Data Normalization** - No JSON parsing/serialization overhead
6. **Report Generation** - Easier to generate statistics and reports

## Migration Notes

- Old JSON fields in complaints table should be removed after confirming all data has been migrated
- Existing draft/submitted complaints should be treated as "submitted" (is_draft=false)
- Queries should now use JOIN operations instead of JSON parsing

## API Testing

### Test Save Draft
```bash
curl -X POST http://localhost:8000/api/complaints/save-draft \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": {...},
    "victims": [...],
    "suspects": [...],
    "attachments": [...]
  }'
```

### Test Submit
```bash
curl -X POST http://localhost:8000/api/complaints/submit \
  -H "Content-Type: application/json" \
  -d '{
    "complaint": {...},
    "victims": [...],
    "suspects": [...],
    "attachments": [...]
  }'
```

### Test Retrieve
```bash
curl http://localhost:8000/api/complaints/{complaint_id}
```

## Troubleshooting

### Issue: Foreign key constraint error
**Solution:** Ensure complaint_id is created before creating related records. The code uses `db.flush()` to get the complaint_id before creating related records.

### Issue: Draft not saving
**Solution:** Check that the `is_draft` column exists in the database. Run `alembic upgrade head` to apply migration 007.

### Issue: Age not parsing correctly
**Solution:** Age should be sent as a string (e.g., "35") and will be converted to integer. Empty strings are converted to None.
