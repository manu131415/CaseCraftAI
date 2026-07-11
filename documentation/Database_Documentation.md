# Database Documentation

## Project Name

**CaseCraftAI – AI-Assisted Investigation & Legal Documentation Platform**

---

# 1. Introduction

The CaseCraftAI backend uses **PostgreSQL** as its primary relational database and **SQLAlchemy ORM** for database interactions.

The database stores complaint records, case information, officers, legal documents, investigation timelines, and AI-generated information while maintaining relationships between different entities.

Its primary objective is to provide reliable, secure, and structured storage for investigation-related data.

---

# 2. Database Technology

| Component | Technology |
|-----------|------------|
| Database  | PostgreSQL |
| ORM       | SQLAlchemy |
| Language  | Python     |
| Backend   | FastAPI    |

---

# 3. Database Overview

The database is organized around the investigation lifecycle.

```
Complaint
     │
     ▼
Case
     │
     ├──────────────┐
     ▼              ▼
Timeline        Documents
     │              │
     └──────┬───────┘
            ▼
     Investigation History
```

---

# 4. Main Database Tables

The primary tables include:

- Complaints
- Cases
- Officers
- Documents
- Timeline Events

Future versions may include:

- Audit Logs
- Version History
- User Activity Logs

---

# 5. Complaint Table

Purpose:

Stores complaint information submitted by officers.

Typical fields include:

- complaint_id
- complainant_name
- phone
- email
- crime_type
- location
- description
- status
- created_at

Each complaint represents the starting point of an investigation.

---

# 6. Case Table

Purpose:

Stores investigation case information created after complaint verification.

Typical fields include:

- case_id
- complaint_id
- assigned_officer_id
- case_number
- title
- status
- priority
- description
- district
- police_station
- FIR Number
- FIR Date
- Court Details
- Current Stage
- created_at
- updated_at

Each case is linked to a complaint and an investigating officer.

---

# 7. Officer Table

Purpose:

Stores officer information.

Typical fields include:

- officer_id
- name
- designation
- department
- contact information

Officers are assigned to investigations and manage case progress.

---

# 8. Document Table

Purpose:

Stores documents generated or uploaded during investigations.

Typical fields include:

- document_id
- case_id
- document_title
- document_type
- document_path
- created_at

Documents are linked with their respective investigation cases.

---

# 9. Timeline Table

Purpose:

Maintains a chronological history of investigation events.

Typical events include:

- Complaint Registered
- Case Created
- Evidence Uploaded
- Legal Sections Updated
- Documents Generated
- Case Closed

The timeline enables officers to monitor investigation progress.

---

# 10. Entity Relationships

```
Complaint
    │
    │ 1
    ▼
Case
    │
    ├────────────┐
    │            │
    ▼            ▼
Timeline     Documents
    │
    ▼
Officer
```

---

# 11. Database Workflow

```
Complaint Registered
        │
        ▼
Complaint Stored
        │
        ▼
Case Created
        │
        ▼
Officer Assigned
        │
        ▼
Timeline Updated
        │
        ▼
Documents Generated
        │
        ▼
Case Closed
```

---

# 12. AI Integration

The database works closely with the AI modules.

Workflow:

```
Evidence Upload
        │
        ▼
AI Extraction
        │
        ▼
Structured Data
        │
        ▼
Database Storage
        │
        ▼
Knowledge Base Query
        │
        ▼
Legal Recommendation
```

The extracted information is verified before being permanently stored.

---

# 13. Search & Audit

The Search module retrieves information using:

- Case Number
- Complaint Title
- Keywords
- Document Title
- Document Type

Future versions will support:

- Audit Logs
- Version History
- Change Tracking
- Activity Monitoring

---

# 14. Data Integrity

The database maintains integrity through:

- Primary Keys
- Foreign Keys
- Relational Constraints
- Transaction Management
- SQLAlchemy ORM

These mechanisms ensure consistency across investigation records.

---

# 15. Security Considerations

Sensitive investigation records require secure handling.

Measures include:

- Authentication
- Role-based access control
- Controlled database access
- Secure API communication
- Human verification before document approval

---

# 16. Future Enhancements

Planned improvements include:

- Audit Table
- Version History
- Digital Signatures
- Cloud Storage
- Database Replication
- Backup & Recovery
- Analytics Dashboard
- Full-text Search

---

# 17. Conclusion

The PostgreSQL database serves as the backbone of CaseCraftAI by securely storing complaints, investigations, legal documents, officer information, and timeline events. Its relational design enables efficient retrieval of investigation data while supporting AI-assisted workflows, document generation, and future system enhancements.