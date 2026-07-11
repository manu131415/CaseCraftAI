# API Documentation

## Project Name

**CaseCraftAI – AI-Assisted Investigation & Legal Documentation Platform**

---

# 1. Introduction

This document describes the REST APIs exposed by the CaseCraftAI backend. These APIs enable communication between the frontend, backend services, Artificial Intelligence modules, and the database.

The backend is implemented using **FastAPI** and follows RESTful design principles.

---

# 2. Base URL

```
http://localhost:8000
```

---

# 3. Complaint APIs

## Register Complaint

**POST**

```
/api/complaints
```

### Description

Registers a new complaint.

### Request

```json
{
  "complainant_name": "...",
  "phone": "...",
  "crime_type": "...",
  "description": "...",
  "attachments": []
}
```

### Response

```json
{
  "success": true,
  "complaint_id": "CMP001"
}
```

---

## Upload Evidence

**POST**

```
/api/complaints/upload
```

### Supported Files

- Image
- PDF
- Audio

### Response

Returns extracted AI information.

---

## Get Complaint

**GET**

```
/api/complaints/{complaint_id}
```

Returns complaint details.

---

## Update Complaint

**PUT**

```
/api/complaints/{complaint_id}
```

Updates complaint information.

---

## Delete Complaint

**DELETE**

```
/api/complaints/{complaint_id}
```

Deletes complaint record.

---

# 4. Case APIs

## Create Case

**POST**

```
/api/cases
```

Creates a new investigation case.

---

## Get Case

**GET**

```
/api/cases/{case_id}
```

Returns case information.

---

## Update Case

**PUT**

```
/api/cases/{case_id}
```

Updates investigation details.

---

## Search Cases & Documents

**GET**

```
/api/cases/search
```

### Query Parameters

| Parameter | Description    |
|-----------|----------------|
| q         | Search keyword |

### Searches

- Case Number
- Complaint Title
- Description
- Document Title
- Document Type

### Response

```json
{
  "cases": [],
  "documents": []
}
```

---

# 5. Recommendation APIs

## Legal Recommendation

**POST**

```
/api/recommendation
```

Provides AI-assisted legal recommendations using the knowledge base.

---

# 6. Timeline APIs

## Add Timeline Event

**POST**

```
/api/timeline
```

Adds a new investigation event.

---

## Get Timeline

**GET**

```
/api/timeline/{case_id}
```

Returns investigation history.

---

# 7. Document APIs

## Generate Document

**POST**

```
/api/documents/generate
```

Generates legal documents.

Examples:

- FIR
- Chargesheet
- Notice

---

# 8. Response Codes

| Code | Meaning                |
|------|------------------------|
| 200  | Success                |
| 201  | Created                |
| 400  | Bad Request            |
| 401  | Unauthorized           |
| 404  | Not Found              |
| 500  | Internal Server Error  |

---

# 9. Authentication

Authenticated officers can access protected APIs.

Future versions may support:

- JWT Authentication
- Role-based Authorization

---

# 10. Conclusion

The REST APIs of CaseCraftAI provide modular communication between the frontend, backend, AI services, and database. Their design supports scalability and simplifies future integration with additional modules and external systems.