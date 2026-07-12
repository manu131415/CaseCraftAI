# 06. System Architecture

## Project Name

**CaseCraftAI – AI-Assisted Investigation and Legal Documentation Platform**

---

# 1. Introduction

CaseCraftAI follows a modular client-server architecture that combines Artificial Intelligence, Retrieval-Augmented Generation (RAG), and structured case management to support law enforcement officers during complaint registration, investigation, legal recommendation, and document generation.

The architecture separates the frontend, backend, AI services, database, and knowledge base into independent components, making the system scalable, maintainable, and easier to extend.

---

# 2. High-Level Architecture

```
                    ┌─────────────────────────────┐
                    │        Frontend (Next.js)    │
                    │ Officer Dashboard & UI       │
                    └──────────────┬──────────────┘
                                   │
                              REST APIs
                                   │
                    ┌──────────────▼──────────────┐
                    │      Backend (FastAPI)       │
                    │ Business Logic & APIs        │
                    └───────┬─────────┬────────────┘
                            │         │
                            │         │
                 ┌──────────▼───┐  ┌──▼──────────────┐
                 │ PostgreSQL   │  │ AI Services     │
                 │ Database     │  │ Gemini + RAG    │
                 └──────────────┘  └──────┬──────────┘
                                          │
                               ┌──────────▼──────────┐
                               │ Legal Knowledge Base│
                               │ BNS / BNSS / PDFs   │
                               └─────────────────────┘
```

---

# 3. Architecture Components

## 3.1 Frontend Layer

The frontend provides the interface used by police officers.

Responsibilities include:

- User authentication
- Complaint registration
- Case management
- Timeline visualization
- Document generation
- Search & Audit
- Dashboard and reports

### Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## 3.2 Backend Layer

The backend manages all business logic and communication between the frontend, AI services, and database.

Responsibilities include:

- Complaint APIs
- Case APIs
- AI extraction
- Search APIs
- Timeline management
- Document generation
- Recommendation engine
- Database interaction

### Technologies

- FastAPI
- Python
- SQLAlchemy ORM

---

## 3.3 Database Layer

The PostgreSQL database stores all structured information used by the system.

Major entities include:

- Complaints
- Cases
- Officers
- Documents
- Timeline Events
- Audit Records (Future)
- Legal Recommendations

The database serves as the central source of truth for all investigation data.

---

## 3.4 AI Layer

Artificial Intelligence assists officers during complaint processing and investigation.

The AI layer is responsible for:

- Information extraction
- Complaint understanding
- Legal recommendation
- Document assistance
- Structured response generation

The AI never makes final legal decisions independently.

---

## 3.5 Knowledge Base (RAG)

Instead of relying only on the language model, the system retrieves relevant legal information from a curated knowledge base.

The knowledge base contains:

- Bharatiya Nyaya Sanhita (BNS)
- Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Other legal reference documents
- Project-specific legal resources

Retrieved information is provided to the AI before generating recommendations.

---

# 4. Request Flow

A typical request follows the sequence below.

```
Officer
    │
    ▼
Frontend
    │
REST API
    │
    ▼
FastAPI Backend
    │
    ├── Database
    │
    ├── AI Services
    │
    └── Knowledge Base
    │
    ▼
Processed Response
    │
    ▼
Frontend
```

---

# 5. Complaint Processing Architecture

```
Complaint
      │
      ▼
Validation
      │
      ▼
Evidence Upload
      │
      ▼
AI Extraction
      │
      ▼
Officer Verification
      │
      ▼
Database
      │
      ▼
Case Creation
```

---

# 6. Search & Audit Architecture

The Search & Audit module allows officers to retrieve historical records efficiently.

Search supports:

- Case Number
- Complaint Title
- Keywords
- Document Title
- Document Type

Workflow:

```
Search Request
      │
      ▼
Backend API
      │
      ▼
Database Query
      │
      ▼
Matching Cases
Matching Documents
      │
      ▼
Frontend Results
```

Future versions will extend this module with:

- Audit logs
- Version history
- Activity tracking
- Change comparison

---

# 7. AI Recommendation Architecture

```
Complaint
      │
      ▼
Knowledge Base Search
      │
      ▼
Relevant Legal Context
      │
      ▼
Gemini AI
      │
      ▼
Legal Recommendations
      │
      ▼
Officer Review
```

Using Retrieval-Augmented Generation (RAG) improves factual reliability by grounding AI responses in trusted legal documents.

---

# 8. Security Architecture

The system incorporates multiple security measures.

### Authentication

- Secure officer login

### Authorization

- Role-based access control

### Data Protection

- Secure database storage
- Controlled API access
- Human verification before document approval

### Auditability

- Timeline tracking
- Search history (future)
- Audit trail (future)

---

# 9. Scalability

The modular architecture allows future enhancements without major redesign.

Possible future modules include:

- Mobile Application
- Court Management Integration
- Digital Signatures
- Multilingual Document Generation
- Predictive Investigation Analytics
- Government Database Integration
- Cloud Deployment

---

# 10. Advantages of the Architecture

The proposed architecture offers several benefits:

- Modular design
- Easy maintenance
- High scalability
- Separation of concerns
- AI-assisted but human-controlled workflow
- Reliable legal recommendations using RAG
- Simplified integration of future modules

---

# 11. Conclusion

CaseCraftAI adopts a modular client-server architecture that integrates modern web technologies, Artificial Intelligence, Retrieval-Augmented Generation (RAG), and structured database management into a unified investigation support platform.

The architecture enables efficient communication between the frontend, backend, AI services, database, and knowledge base while maintaining scalability, maintainability, and legal reliability. Its modular design also provides a strong foundation for future enhancements such as multilingual document generation, advanced audit tracking, analytics, and cloud deployment.