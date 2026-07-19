# Quick Start Guide - Complaint Ingestion System

## Prerequisites

1. Backend dependencies installed: `pip install -r backend/requirements.txt`
2. Database connection configured in `.env`
3. Cloudinary credentials configured in `.env`

## Setup Steps

### Step 1: Apply Database Migration

```bash
cd backend

# Apply the new migration that adds is_draft column
alembic upgrade head

# Verify migration
alembic current
```

### Step 2: Verify Models

The following models have been updated/verified:
- ✅ `models/complaint.py` - Added `is_draft` Boolean column
- ✅ `models/victim.py` - Uses `complaint_id` foreign key
- ✅ `models/suspect.py` - Uses `complaint_id` foreign key
- ✅ `models/evidence.py` - Uses `complaint_id` foreign key
- ✅ `models/document.py` - Uses `complaint_id` foreign key

### Step 3: Update API Endpoints

Updated file: `app/apis/complaints.py`

New endpoints:
- ✅ `POST /api/complaints/save-draft` - Save complaint as draft
- ✅ Updated `POST /api/complaints/submit` - Now creates related records
- ✅ Updated `GET /api/complaints/{complaint_id}` - Fetches related records
- ✅ Updated `DELETE /api/complaints/{complaint_id}` - Cascades delete related records

### Step 4: Update Frontend

Updated files:
- ✅ `components/complaint/ComplaintWizard.tsx` - Added handleSaveDraft function
- ✅ `components/complaint/NavigationButtons.tsx` - Added Save Draft button

## Testing the Endpoints

### 1. Start Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

### 3. Test Save Draft Endpoint

**Method:** POST
**URL:** `http://localhost:8000/api/complaints/save-draft`
**Body:**
```json
{
  "complaint": {
    "complaintTitle": "Test Complaint",
    "crimeCategory": "Theft",
    "crimeSubcategory": "Shoplifting",
    "priority": "Medium",
    "complaintMode": "Walk-In",
    "incidentDate": "2026-07-19",
    "incidentTime": "14:30",
    "location": "Main Street",
    "landmark": "Near Market",
    "emergency": "No",
    "description": "Test description",
    "officerNotes": "",
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
    "complainantNationality": "Indian",
    "aiSummary": ""
  },
  "victims": [
    {
      "fullName": "Jane Smith",
      "age": "28",
      "gender": "Female",
      "phone": "9876543211",
      "address": "456 Oak Ave",
      "injuries": "None",
      "photoUrl": "",
      "photoName": ""
    }
  ],
  "suspects": [
    {
      "fullName": "Unknown Person",
      "alias": "",
      "fatherName": "",
      "age": "",
      "dob": "",
      "gender": "",
      "permanentAddress": "",
      "presentAddress": "",
      "identificationMarks": "",
      "faceShape": "",
      "complexion": "",
      "eyeColor": "",
      "eyeStructure": "",
      "hairType": "",
      "hairColor": "",
      "unknownIdentity": true,
      "photoUrl": "",
      "photoName": ""
    }
  ],
  "attachments": []
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Complaint saved as draft successfully",
  "data": {
    "complaint_id": "uuid-xxx",
    "complaint_number": "CMP-2026-000001",
    "status": "Draft",
    "is_draft": true,
    "created_at": "2026-07-19T..."
  }
}
```

### 4. Test Submit Endpoint

**Method:** POST
**URL:** `http://localhost:8000/api/complaints/submit`
**Body:** (Same as save draft, but will create a submitted complaint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaint_id": "uuid-yyy",
    "complaint_number": "CMP-2026-000002",
    "status": "Submitted",
    "is_draft": false,
    "created_at": "2026-07-19T..."
  }
}
```

### 5. Test Get Complaint with Related Records

**Method:** GET
**URL:** `http://localhost:8000/api/complaints/{complaint_id}`

**Expected Response:** (Includes victims, suspects, documents arrays)
```json
{
  "complaint_id": "uuid-xxx",
  "complaint_number": "CMP-2026-000001",
  "complainant_name": "John Doe",
  "status": "Submitted",
  "is_draft": false,
  "victims": [
    {
      "victim_id": 1,
      "complaint_id": "uuid-xxx",
      "fullName": "Jane Smith",
      "age": 28,
      "gender": "Female",
      ...
    }
  ],
  "suspects": [
    {
      "suspect_id": 1,
      "complaint_id": "uuid-xxx",
      "fullName": "Unknown Person",
      "unknownIdentity": true,
      ...
    }
  ],
  "documents": []
}
```

### 6. Test List All Complaints

**Method:** GET
**URL:** `http://localhost:8000/api/complaints`

**Expected Response:**
```json
{
  "complaints": [
    {
      "complaint_id": "uuid-xxx",
      "complaint_number": "CMP-2026-000001",
      "status": "Submitted",
      "is_draft": false,
      ...
    }
  ]
}
```

### 7. Test Delete Complaint

**Method:** DELETE
**URL:** `http://localhost:8000/api/complaints/{complaint_id}`

**Expected Response:**
```json
{
  "success": true,
  "message": "Complaint deleted successfully"
}
```

## Frontend Testing

### Testing Save Draft in UI

1. Navigate to http://localhost:3000/complaint
2. Fill in some basic information
3. Click "Save Draft" button (appears next to Continue/Submit buttons)
4. Verify success message with complaint ID
5. Refresh page and verify data is saved

### Testing Submit in UI

1. Complete all complaint form steps
2. Review the submission summary
3. Click "Submit Complaint" button
4. Verify success message with complaint number
5. Verify status shows "Submitted" in complaint list

## Database Verification

Check database to verify data is stored correctly:

```sql
-- Check complaints table
SELECT id, complaint_id, complaint_number, status, is_draft FROM complaints LIMIT 5;

-- Check victims
SELECT victim_id, complaint_id, full_name FROM victims;

-- Check suspects
SELECT suspect_id, complaint_id, full_name, unknown_identity FROM suspects;

-- Verify foreign keys
SELECT c.complaint_id, COUNT(v.victim_id) as victim_count, COUNT(s.suspect_id) as suspect_count
FROM complaints c
LEFT JOIN victims v ON c.complaint_id = v.complaint_id
LEFT JOIN suspects s ON c.complaint_id = s.complaint_id
GROUP BY c.complaint_id;
```

## Common Issues & Solutions

### Issue: Foreign key constraint violation
**Solution:** Ensure database migrations have been applied (`alembic upgrade head`)

### Issue: `is_draft` column not found
**Solution:** Apply migration: `alembic upgrade 007`

### Issue: Victims/Suspects not showing in GET response
**Solution:** Verify they were created by checking the database directly

### Issue: Frontend Save Draft button not visible
**Solution:** Ensure you've updated both ComplaintWizard.tsx and NavigationButtons.tsx

### Issue: Age validation error
**Solution:** Send age as string in JSON (e.g., "35"), not as number

### Issue: Date parsing error
**Solution:** Use ISO format for dates (YYYY-MM-DD)

## Deployment Checklist

Before deploying to production:

- [ ] Database migrations applied successfully
- [ ] All endpoints tested locally
- [ ] Frontend Save Draft button working
- [ ] Complaints can be submitted and retrieved
- [ ] Related records (victims, suspects) are created correctly
- [ ] Cloudinary upload is configured
- [ ] CORS settings updated if needed
- [ ] Environment variables set in production
- [ ] Database backups in place before migration

## Next Steps

1. Test the complaint registration flow end-to-end
2. Verify data integrity in database
3. Test draft editing and re-submission
4. Implement complaint status workflows
5. Add complaint search/filter functionality
6. Generate reports from complaint data

## Documentation

Full API documentation: `backend/COMPLAINT_INGESTION_GUIDE.md`
