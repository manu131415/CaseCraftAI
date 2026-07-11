# 06. System Architecture

## Introduction

The AI-Powered Investigation Assistant follows a modular architecture in which each component performs a specific responsibility while communicating through well-defined APIs. This approach improves maintainability, scalability, and allows different modules to be developed independently before being integrated into a single system.

The architecture combines complaint processing, AI-based legal assistance, Retrieval-Augmented Generation (RAG), document generation, and centralized case management into one unified platform.

---

# Design Principles

The system is designed around the following principles:

- Modular architecture for easier development and maintenance.
- Human-in-the-Loop AI to ensure legal accountability.
- Centralized Case Data Pool to eliminate duplicate data entry.
- Retrieval-Augmented Generation (RAG) to improve factual accuracy and reduce hallucinations.
- Template-based document generation for consistency across official documents.
- Scalable design allowing additional investigation modules to be added in the future.

---

# 1. Frontend

The frontend provides the primary interface for investigating officers to interact with the system.

Major responsibilities include:

- Complaint Registration
- Case Dashboard
- AI Recommendation Display
- FIR Review & Editing
- Document Preview
- PDF Download
- Case Timeline Visualization

The frontend communicates with the backend through REST APIs.

---

# 2. Backend

The backend acts as the central coordinator of the application.

Its responsibilities include:

- Processing incoming complaints
- Managing case records
- Communicating with AI services
- Retrieving legal references
- Generating investigation documents
- Managing APIs and database operations

The backend also coordinates communication between all major modules.

---

# 3. Case Data Pool

The Case Data Pool serves as the centralized repository for all investigation-related information.

It stores:

- Complaint Details
- Complainant Information
- Victim Details
- Suspect Details
- Investigation Updates
- AI Recommendations
- Generated Documents
- Case Diary Entries

All modules access this common dataset, ensuring information remains consistent throughout the investigation lifecycle.

---

# 4. AI & Legal Intelligence Module

The AI module assists investigating officers by understanding complaints and generating legally relevant recommendations.

Its responsibilities include:

- Complaint Analysis
- Entity Extraction
- Complaint Summarization
- Crime Classification
- Legal Section Recommendation
- FIR Draft Generation

Rather than generating responses independently, the AI first receives relevant legal context through the RAG pipeline.

---

# 5. Legal Knowledge Base

The Legal Knowledge Base contains official legal resources used by the Retrieval-Augmented Generation (RAG) system.

The knowledge base includes:

- Bharatiya Nyaya Sanhita (BNS)
- Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Bharatiya Sakshya Adhiniyam (BSA)
- Government Guidelines
- Landmark Judgements (Future Scope)

The documents are processed into searchable chunks, allowing relevant legal information to be retrieved before AI response generation.

---

# 6. Document Generation Module

The Document Generation Module creates official investigation documents using predefined templates and information already stored in the Case Data Pool.

The initial implementation supports:

- First Information Report (FIR)
- Remand Request
- Medical Examination Request
- Property Seizure Memo
- Panchanama

The system automatically fills common information while allowing officers to review and edit investigation-specific details before finalization.

---

# 7. Digital Case Diary

The Digital Case Diary maintains a chronological record of the investigation.

It records:

- Complaint Registration
- AI Recommendations
- Officer Actions
- Generated Documents
- Investigation Progress

This provides investigators with a centralized timeline of all important case activities.

---

# 8. Data Flow

The interaction between system components follows the sequence below:

1. Complaint Registration
2. Complaint Ingestion
3. Case Data Pool
4. AI Complaint Analysis
5. Legal Knowledge Retrieval (RAG)
6. AI Recommendation Generation
7. Officer Review & Approval
8. Document Generation
9. Case Diary Update
10. PDF Export

Each stage builds upon the previous one while using the centralized Case Data Pool as the primary source of information.

---

# Advantages of the Architecture

The proposed architecture offers several advantages:

- Modular and scalable design.
- Reduced repetitive data entry.
- Improved legal accuracy through Retrieval-Augmented Generation (RAG).
- Human oversight for every AI-generated recommendation.
- Easier integration of future AI modules and additional investigation documents.
- Consistent document generation using standardized templates.

---

# Conclusion

The modular architecture of CaseCraftAI enables seamless collaboration between complaint processing, AI analysis, legal retrieval, document generation, and case management. By combining Retrieval-Augmented Generation (RAG) with a centralized Case Data Pool and Human-in-the-Loop validation, the platform assists investigating officers while ensuring that all legal decisions remain under human supervision.

The architecture is designed to support future enhancements, including additional investigation documents, multilingual support, advanced analytics, and integration with external law enforcement systems.