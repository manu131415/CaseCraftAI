# Data Model Architecture - Before & After

## System Architecture Diagram

### BEFORE: JSON-Based Storage
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend UI                           │
│  Complaint Form (6-step wizard)                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ POST /api/complaints/submit
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                       │
│  Single submission handler                              │
│  - Receives all form data at once                        │
│  - Serializes to JSON strings                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ INSERT/UPDATE
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  Database                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │            complaints table                     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ complaint_id (PK)                               │   │
│  │ complaint_number                                │   │
│  │ complaint_title                                 │   │
│  │ ... (other complaint fields)                    │   │
│  │                                                 │   │
│  │ victim_data (TEXT/JSON)      ← All victims     │   │
│  │ suspect_data (TEXT/JSON)     ← All suspects    │   │
│  │ attachment_data (TEXT/JSON)  ← All documents   │   │
│  │                                                 │   │
│  │ status = "Pending"                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

Problems:
❌ No foreign key relationships
❌ JSON requires parsing/serialization
❌ Difficult to query individual victims
❌ No draft support
❌ All-or-nothing submission
❌ Hard to generate reports
```

### AFTER: Relational Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend UI                           │
│  Complaint Form (6-step wizard)                          │
│  + Save Draft button (new)                              │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        │ (incomplete)        │ (complete)
        ▼                     ▼
   /save-draft          /submit
        │                     │
        │                     │
┌───────▼─────────────────────▼────────────────────────────┐
│              Backend API (FastAPI)                       │
│  Two submission paths:                                  │
│  - Draft: Store partial data, is_draft=true             │
│  - Submit: Store complete data, is_draft=false          │
│  - Create related records individually                  │
└──────────┬───────────────────────────────────────────────┘
           │
    ┌──────┴──────────────┬──────────────────┬──────────┐
    │                     │                  │          │
    ▼                     ▼                  ▼          ▼
 INSERT               INSERT             INSERT      INSERT
 ┌───────────────┐  ┌───────────────┐  ┌───────────┐ ┌────────────┐
 │ complaints    │  │ victims       │  │ suspects  │ │ evidence   │
 │               │  │               │  │           │ │            │
 │ id (PK)       │  │ id (PK)       │  │ id (PK)   │ │ id (PK)    │
 │ complaint_id  │  │ complaint_id  │  │ complaint │ │ complaint_ │
 │ (unique)      │  │ (FK)          │  │ id (FK)   │ │ id (FK)    │
 │ complaint_num │  │               │  │           │ │            │
 │ title         │  │ full_name     │  │ full_name │ │ file_name  │
 │ description   │  │ age           │  │ age       │ │ file_type  │
 │ location      │  │ gender        │  │ gender    │ │ file_path  │
 │ ... etc       │  │ phone         │  │ phone     │ │ ... etc    │
 │               │  │ address       │  │ address   │ │            │
 │ is_draft (new)│  │ injuries      │  │ dob       │ │            │
 │ status        │  │ photo_url     │  │ unknown_  │ │            │
 │               │  │               │  │ identity  │ │            │
 │ created_at    │  │               │  │ photo_url │ │            │
 └───────┬───────┘  └────────┬──────┘  └────┬──────┘ └────────┬───┘
         │ (1)              │ (N)           │ (N)           │ (N)
         │                  │               │               │
         └──────────────────┴───────────────┴───────────────┘
                            │
                    (Foreign Keys)
                 All linked to complaint_id

Benefits:
✅ Proper database relationships
✅ Foreign key constraints
✅ Easy individual record queries
✅ Draft support with is_draft flag
✅ Incremental data entry
✅ Simple reporting queries
✅ Cascade deletes
```

## Data Flow Comparison

### BEFORE: Submission Flow
```
User Form
   │
   └─ All data collected
   │
   └─ JSON.stringify(victims)
   │
   └─ JSON.stringify(suspects)
   │
   └─ JSON.stringify(attachments)
   │
   └─ POST to /submit (ONE large payload)
   │
   └─ Database stores as TEXT fields
   │
   └─ On retrieval: JSON.parse() each field
   │
   └─ Frontend receives parsed data

Issues:
- All or nothing submission
- No progress saving
- No data validation per record
- Heavy JSON parsing overhead
```

### AFTER: Submission Flow
```
User Form (Step 1-5)
   │
   └─ Click "Save Draft"
   │
   ├─ POST /save-draft
   │  ├─ Insert 1 Complaint (is_draft=true)
   │  ├─ Insert N Victim records
   │  ├─ Insert M Suspect records
   │  └─ Return complaint_id
   │
   └─ User continues editing
   │
   └─ Click "Submit" (Step 6)
   │
   ├─ POST /submit
   │  ├─ Insert 1 Complaint (is_draft=false)
   │  ├─ Insert N Victim records
   │  ├─ Insert M Suspect records
   │  ├─ Insert K Evidence records
   │  └─ Return complaint_id
   │
   └─ On retrieval: Simple JOIN queries
   │
   └─ Frontend receives structured data

Benefits:
- Progressive data entry
- Multiple save points
- Automatic data validation per record
- Zero JSON parsing needed
- Type safety at database level
```

## API Response Format Comparison

### BEFORE: Combined JSON Storage
```json
{
  "complaint_id": "uuid-1",
  "complaint_number": "CMP-2026-001",
  "victim_data": "[{\"fullName\":\"Jane\",\"age\":28,...}]",
  "suspect_data": "[{\"fullName\":\"Unknown\",\"unknownIdentity\":true,...}]",
  "attachment_data": "[{\"fileName\":\"doc.pdf\",...}]",
  "status": "Pending"
}
```

**Problem**: Frontend must parse 3 JSON strings!

### AFTER: Structured Records
```json
{
  "complaint_id": "uuid-1",
  "complaint_number": "CMP-2026-001",
  "status": "Submitted",
  "is_draft": false,
  
  "victims": [
    {
      "victim_id": 1,
      "complaint_id": "uuid-1",
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
      "complaint_id": "uuid-1",
      "fullName": "Unknown Person",
      "unknownIdentity": true,
      "age": 40,
      "gender": "Male",
      "photoUrl": "https://...",
      "photoName": "suspect_photo.jpg"
    }
  ],
  
  "documents": [
    {
      "document_id": "doc-1",
      "complaint_id": "uuid-1",
      "fileName": "FIR_document.pdf",
      "fileType": "application/pdf",
      "filePath": "https://cloudinary.../fir.pdf"
    }
  ]
}
```

**Benefit**: Frontend receives typed arrays, no parsing needed!

## Database Query Comparison

### Query: Find all complaints with victim named "Jane"

**BEFORE:**
```sql
SELECT * FROM complaints 
WHERE victim_data::jsonb @> '[{"fullName":"Jane"}]'
  OR victim_data LIKE '%"fullName":"Jane"%';
```

**Problem**: Complex JSON queries, no indexes

**AFTER:**
```sql
SELECT DISTINCT c.* FROM complaints c
JOIN victims v ON c.complaint_id = v.complaint_id
WHERE v.full_name = 'Jane';
```

**Benefit**: Simple JOIN, can index on full_name!

### Query: Count victims per complaint

**BEFORE:**
```sql
SELECT complaint_id, 
  json_array_length(victim_data::jsonb) as victim_count
FROM complaints;
```

**AFTER:**
```sql
SELECT complaint_id, COUNT(*) as victim_count
FROM victims
GROUP BY complaint_id;
```

**Benefit**: Native GROUP BY, aggregate functions!

### Query: Find all unknown suspects

**BEFORE:**
```sql
SELECT * FROM complaints
WHERE suspect_data::jsonb @> '[{"unknownIdentity":true}]';
```

**AFTER:**
```sql
SELECT * FROM suspects
WHERE unknown_identity = true;
```

**Benefit**: Simple WHERE clause, can index on boolean!

## Transaction Safety Comparison

### BEFORE: Single Large Transaction
```python
# Either all JSON fields succeed or none
try:
  complaint = Complaint(
    victim_data=json.dumps(victims),  # May fail
    suspect_data=json.dumps(suspects),  # May fail
    attachment_data=json.dumps(attachments)  # May fail
  )
  db.add(complaint)
  db.commit()  # All or nothing
except Exception:
  db.rollback()
```

**Problem**: Complex data loses individual record validation

### AFTER: Granular Transactions
```python
# Each record validated individually
try:
  # Create complaint
  complaint = Complaint(...)
  db.add(complaint)
  db.flush()  # Get complaint_id
  
  # Create victims with validation
  for victim_data in victims:
    if victim_data.fullName:  # Validation!
      victim = Victim(complaint_id=complaint.complaint_id, ...)
      db.add(victim)
  
  # Similar for suspects, evidence
  
  db.commit()  # All succeed together
except Exception:
  db.rollback()  # Full rollback if any part fails
```

**Benefit**: Individual record validation + transaction safety!

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **Data Storage** | JSON strings | Individual tables |
| **Foreign Keys** | None | Yes (complaint_id) |
| **Draft Support** | No | Yes (is_draft flag) |
| **Query Performance** | Complex JSON parsing | Direct SQL joins |
| **Indexing** | Limited | Full support |
| **Reporting** | Manual JSON processing | Native SQL aggregates |
| **Data Validation** | Bulk validation | Per-record validation |
| **Cascade Deletes** | Manual cleanup | Automatic (FK) |
| **API Response** | Needs JSON parsing | Ready to use arrays |
| **Scalability** | Limited to JSON size | Unlimited records |
| **Type Safety** | Pydantic only | DB constraints + ORM |

## Migration Path

```
Step 1: Deploy new backend code (backward compatible)
        ├─ Old JSON fields still read
        ├─ New code uses new tables
        └─ Parallel system during transition

Step 2: Apply database migration (007)
        ├─ Add is_draft column
        ├─ Backfill existing complaints with is_draft=false
        └─ Existing data still accessible

Step 3: Migrate existing data (optional)
        ├─ Parse JSON from old fields
        ├─ Create individual records
        ├─ Verify data integrity
        └─ Delete old JSON fields

Step 4: Deploy frontend changes
        ├─ Add Save Draft button
        ├─ Update form handling
        └─ Use new API format

Step 5: Deprecate old endpoint (future)
        ├─ Remove JSON parsing code
        ├─ Clean up old columns
        └─ Optimize queries
```

---

**This architecture change provides better data integrity, easier maintenance, and enables new features like draft saving without database size penalties.**
