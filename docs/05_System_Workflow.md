# 05. System Workflow

## Introduction

The AI-Powered Investigation Assistant follows a structured workflow that assists investigating officers from complaint registration to document generation while maintaining complete human supervision over all legal decisions.

The workflow integrates complaint processing, AI analysis, legal retrieval, document generation, and case management into a single investigation pipeline.

---

# Step 1 – Complaint Registration

The investigation begins when an investigating officer registers a new complaint through the Complaint Registration Wizard.

The officer enters all available case information, including:

- Complaint Details
- Complainant Details
- Victim Details
- Suspect Details (if available)
- Incident Details
- Supporting Evidence (future scope)

Once submitted, the information is forwarded to the Complaint Ingestion API.

---

# Step 2 – Complaint Ingestion

The Complaint Ingestion API validates the received information and converts it into a structured case format.

The system:

- Validates mandatory fields
- Generates a unique Case ID
- Standardizes collected information
- Stores the information in the Case Data Pool

This centralized repository becomes the single source of truth for all subsequent modules.

---

# Step 3 – AI Complaint Analysis

The complaint is analyzed using Natural Language Processing (NLP).

The AI identifies important entities such as:

- Victim
- Suspect
- Location
- Crime Type
- Dates & Time
- Important Events

These extracted entities help create a structured understanding of the complaint.

---

# Step 4 – Legal Knowledge Retrieval (RAG)

Instead of relying only on a Large Language Model, the system retrieves relevant legal information from its legal knowledge base.

The retrieval system searches:

- Bharatiya Nyaya Sanhita (BNS)
- Bharatiya Nagarik Suraksha Sanhita (BNSS)
- Bharatiya Sakshya Adhiniyam (BSA)
- Government Guidelines
- Landmark Judgements

The retrieved information is provided to the LLM as context before response generation, improving factual accuracy and reducing hallucinations.

---

# Step 5 – AI Legal Assistance

Using the complaint information together with retrieved legal references, the AI generates:

- Complaint Summary
- Crime Category
- Applicable Legal Sections
- Explanation for each recommendation
- FIR Draft

The generated outputs act as recommendations and are presented for officer review.

---

# Step 6 – Officer Review & Approval

Every AI-generated recommendation is reviewed by the investigating officer.

The officer may:

- Review recommendations
- Edit generated content
- Modify legal sections
- Approve the final FIR

No AI-generated content becomes official without officer approval.

---

# Step 7 – Investigation Document Generation

Once the FIR is approved, CaseCraftAI generates investigation documents using predefined templates and the centralized Case Data Pool.

Supported documents include:

- Remand Request
- Medical Examination Request
- Property Seizure Memo
- Panchanama

The system automatically fills common information while allowing officers to edit investigation-specific details before finalization.

---

# Step 8 – Digital Case Diary

Throughout the investigation, all significant events are recorded in a digital Case Diary.

This includes:

- Complaint Registration
- AI Recommendations
- Generated Documents
- Officer Actions
- Investigation Updates

The Case Diary provides a chronological history of the investigation.

---

# Step 9 – Document Export

After approval, all generated documents can be exported as PDF files for official use.

These documents become part of the digital investigation record and may be printed, shared, or stored for future reference.

---

# Conclusion

The workflow demonstrates how AI can assist investigating officers throughout the investigation lifecycle without replacing human decision-making. By combining structured complaint processing, Retrieval-Augmented Generation (RAG), centralized case management, and automated document generation, the platform reduces repetitive administrative work while maintaining legal accountability, transparency, and human oversight.