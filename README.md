# ⚖️ CaseCraftAI

> **AI-Assisted Investigation & Legal Documentation Platform for Modern Law Enforcement**

CaseCraftAI is an AI-powered investigation support platform designed to simplify police workflows by combining complaint registration, AI-assisted information extraction, legal recommendation, case management, document generation, and intelligent search into a single integrated system.

Instead of replacing investigating officers, CaseCraftAI acts as an intelligent assistant that reduces repetitive documentation work while ensuring that all legal decisions remain under human supervision.

---

# 📖 Table of Contents

- About the Project
- Problem Statement
- Key Features
- System Workflow
- System Architecture
- Technology Stack
- Project Structure
- Installation
- Running the Project
- Future Scope
- Contributors

---

# 📌 About the Project

Law enforcement agencies process large volumes of complaints, evidence, investigation reports, and legal documents every day. Manual documentation is often repetitive, time-consuming, and prone to inconsistencies.

CaseCraftAI was developed to assist officers throughout the investigation lifecycle using Artificial Intelligence and Retrieval-Augmented Generation (RAG). The platform streamlines complaint registration, evidence processing, legal recommendation, case management, and document generation while maintaining human oversight for all legal decisions.

---

# 🎯 Problem Statement

Current investigation workflows involve significant manual effort in:

- Complaint registration
- Evidence processing
- Legal section identification
- Case management
- Document preparation
- Historical case retrieval

These repetitive administrative tasks reduce the time officers can spend on actual investigations.

CaseCraftAI addresses these challenges by providing AI-assisted investigation support while ensuring that officers remain responsible for all final legal decisions.

---

# ✨ Key Features

### 📝 Complaint Registration

- Register complaints digitally
- Manual complaint entry
- Upload supporting evidence

---

### 🤖 AI Information Extraction

- Image processing
- PDF processing
- Audio transcription
- Automatic field extraction

---

### ⚖️ Legal Recommendation

- AI-assisted legal section recommendation
- Knowledge Base integration
- Retrieval-Augmented Generation (RAG)
- Reduced AI hallucinations

---

### 📂 Case Management

- Create and manage investigation cases
- Assign officers
- Track investigation status
- Update case progress

---

### 📄 AI Document Generation

Generate legal documents including:

- FIR
- Chargesheet
- Investigation Reports
- Notices

---

### 📅 Investigation Timeline

Maintain a chronological record of investigation activities.

---

### 🔍 Search & Audit

- Search by Case Number
- Search by Complaint Title
- Search by Keywords
- Search by Document Title
- Search by Document Type
- Audit-ready architecture for future version tracking

---

# 🔄 System Workflow

```
Complaint Registration
        │
        ▼
Evidence Upload
        │
        ▼
AI Information Extraction
        │
        ▼
Officer Verification
        │
        ▼
Case Creation
        │
        ▼
Knowledge Base (RAG)
        │
        ▼
Legal Recommendation
        │
        ▼
Investigation Timeline
        │
        ▼
Document Generation
        │
        ▼
Search & Audit
```

---

# 🏗️ System Architecture

```
Frontend (Next.js)
        │
 REST APIs
        │
FastAPI Backend
   │        │
   │        │
Database   AI Services
(PostgreSQL) (Gemini)
            │
            ▼
     Legal Knowledge Base
```

---

# 💻 Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- Python
- SQLAlchemy

## Database

- PostgreSQL

## Artificial Intelligence

- Google Gemini
- Retrieval-Augmented Generation (RAG)

## Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📁 Project Structure

```
CaseCraftAI/

├── frontend/
│
├── backend/
│
├── docs/
│
├── dataset/
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
python -m uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📚 Documentation

Detailed documentation is available in the `docs/` directory.

- Project Research
- Problem Statement
- Requirements Analysis
- Document Analysis
- System Workflow
- System Architecture
- User Guide

---

# 🔮 Future Scope

- Multilingual Document Generation
- Digital Signatures
- OCR Improvements
- Mobile Application
- Government Database Integration
- Predictive Investigation Analytics
- Advanced Audit Trail
- Cloud Deployment

---

# 👥 Contributors

Developed as part of an academic software engineering project.

Contributors:

- Vaibhavi Parmar
- Manushri
- Harshini
- Garima Lad
- Vyomini Joshi

---

# 📄 License

This project was developed for academic and research purposes.

---

# ⭐ Acknowledgements

Special thanks to all team members, mentors, and open-source technologies that contributed to the successful development of CaseCraftAI.