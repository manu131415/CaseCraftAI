# CaseCraftAI

## Project Research & Solution Proposal

---

# 1. Problem Statement

## Problem Statement

CrimeGPT – AI-Powered Automation for Crime Documentation and Legal Intelligence

---

# 2. Introduction

Police officers spend a significant amount of time preparing First Information Reports (FIRs), identifying applicable legal provisions, generating investigation documents, and maintaining case records. These tasks are often repetitive, time-consuming, and require referring to multiple legal documents and manuals.

Due to the complexity of legal procedures and increasing case loads, manual documentation can lead to delays, inconsistencies, missing information, and human errors. Investigating officers also need to prepare multiple documents during different stages of an investigation, making the overall workflow lengthy and inefficient.

Recent developments in Artificial Intelligence, Large Language Models (LLMs), and Retrieval-Augmented Generation (RAG) provide an opportunity to assist law enforcement agencies by automating documentation while ensuring that generated information is based on verified legal references rather than model assumptions.

---

# 3. Objective

The objective of CaseCraftAI is to develop an AI-powered assistant that supports police officers throughout the documentation process by:

- Assisting in complaint analysis.
- Recommending applicable legal sections.
- Generating structured FIR drafts.
- Creating investigation documents using predefined templates.
- Maintaining a digital case diary.
- Providing legally grounded responses using Retrieval-Augmented Generation (RAG).

The system is designed to reduce documentation time, improve consistency, minimize human error, and assist officers without replacing human decision-making.

---

# 4. Proposed Solution Overview

CaseCraftAI is an AI-assisted crime documentation platform that combines modern web technologies with Retrieval-Augmented Generation (RAG) to assist law enforcement officers during the documentation process.

Instead of relying solely on a Large Language Model, the system retrieves relevant legal provisions, procedural guidelines, and official reference material from a curated knowledge base before generating responses. This approach improves reliability, reduces hallucinations, and ensures that recommendations are supported by authoritative legal sources.

The platform guides officers through complaint registration, analyzes the complaint, recommends relevant legal sections, generates an FIR draft, assists in preparing investigation documents, and maintains a structured digital case history throughout the investigation lifecycle.

The final decision always remains with the investigating officer, who can review, modify, and approve AI-generated content before it is finalized.

---

# 5. Literature Review & Research Findings

Before designing CaseCraftAI, research was conducted on existing AI applications in law enforcement, government initiatives, commercial solutions, and recent academic work related to AI-assisted crime documentation. The objective was to understand current limitations, identify best practices, and design a solution that addresses real-world policing challenges.

Rather than replacing investigating officers, almost every existing solution focuses on assisting officers by reducing documentation time, improving report quality, and providing legally supported recommendations. This observation strongly influenced the overall design of CaseCraftAI.

To better understand the current use of Artificial Intelligence in law enforcement and legal documentation, research was conducted using government publications, academic research papers, and existing AI-assisted policing solutions.

The objective of this research was to identify current challenges, understand how AI is being applied in real-world policing, and learn from existing approaches while designing CaseCraftAI. The findings presented below directly influenced the proposed solution, feature set, and system workflow.

The following findings summarize the key insights gathered during the research phase.

---

## 5.1 AI-Assisted Police Report Writing

**Source**

U.S. Department of Justice (DOJ) – *Using AI to Write Police Reports* (2025)

### Background

The U.S. Department of Justice discusses the growing adoption of AI-assisted report writing systems such as AXON Draft One and Truleo Field Notes. These systems generate initial police report drafts using officer narration and body-camera recordings while keeping officers responsible for reviewing and approving the final report.

### Key Findings

- AI significantly reduces report writing time.
- Reports become more structured and consistent.
- Human verification is mandatory before submission.
- AI assists officers rather than replacing their judgement.
- Transparency and accountability remain essential.

### How It Influenced CaseCraftAI

This research influenced the design of CaseCraftAI by introducing an AI-assisted documentation workflow. Instead of automatically generating final legal documents, the system creates editable drafts that investigating officers review, modify, and approve before submission.



## 5.2 AI Applications in Law Enforcement

**Source**

Bureau of Police Research & Development (BPR&D), Government of India – *AI in the Service of Law Enforcement*

### Background

The BPR&D publication explores how Artificial Intelligence can support modern policing through applications such as digital forensics, cybercrime analysis, multilingual processing, document automation, fraud detection, and evidence analysis. The report emphasizes AI as a productivity tool that assists officers with repetitive and time-consuming tasks.

### Key Findings

- AI improves efficiency in police documentation.
- Digital case management reduces manual work.
- AI supports investigation without replacing officers.
- AI is most effective when integrated into existing police workflows.
- Documentation automation can significantly reduce administrative workload.

### How It Influenced CaseCraftAI

This publication inspired the broader vision of CaseCraftAI. Instead of focusing only on FIR generation, the system supports multiple stages of investigation by combining complaint analysis, legal assistance, document generation, and digital case management within a single platform.



## 5.3 AI-Powered Smart FIR Assistant

**Source**

IEEE Conference Paper – *AI-Powered Smart FIR Assistant for Automated Legal Section Tagging and Filing Support*

### Background

The proposed Smart FIR Assistant applies Natural Language Processing (NLP) techniques to analyze complaint descriptions and recommend relevant legal sections before generating structured FIR drafts. The research demonstrates how AI can simplify FIR preparation while improving consistency and reducing manual effort.

### Key Findings

- Complaint narratives can be analyzed using NLP.
- AI can recommend relevant legal sections.
- FIR drafting becomes faster and more consistent.
- AI-assisted legal tagging reduces manual effort.
- Structured outputs improve documentation quality.

### How It Influenced CaseCraftAI

This research directly influenced the complaint analysis pipeline of CaseCraftAI. The platform analyzes complaint descriptions, recommends applicable legal sections, generates structured FIR drafts, and provides explanations for every recommendation to assist investigating officers.



## 5.4 Retrieval-Augmented Generation (RAG) for Reliable Legal Assistance

**Source**

Research papers and technical documentation on Retrieval-Augmented Generation (RAG), including the original RAG architecture proposed by Meta AI and subsequent implementations for knowledge-grounded AI systems.

### Background

Large Language Models are capable of generating fluent text but may produce inaccurate or fabricated information when answering domain-specific questions. In legal applications, such hallucinations are unacceptable because incorrect legal recommendations may lead to serious consequences.

Retrieval-Augmented Generation addresses this limitation by retrieving relevant information from a trusted knowledge base before generating a response.

### Key Findings

- RAG significantly reduces hallucinations.
- Responses are grounded in trusted documents.
- AI recommendations become more explainable.
- Knowledge bases can be updated without retraining the language model.
- Retrieval improves factual accuracy in specialized domains.

### How It Influenced CaseCraftAI

Instead of relying solely on an LLM, CaseCraftAI retrieves relevant legal provisions from its knowledge base before generating recommendations. This ensures that legal section suggestions and FIR drafts are based on official legal references, improving reliability and reducing the likelihood of hallucinated outputs.



## 5.5 Human-in-the-Loop AI for Legal Documentation

**Source**

Insights derived from government publications, AI governance principles, and existing AI-assisted policing systems.

### Background

Across almost every real-world law enforcement AI system studied, human oversight remains a mandatory component. AI is used to assist officers by reducing repetitive work, while final legal responsibility continues to rest with trained personnel.

### Key Findings

- Human oversight improves trust.
- AI recommendations require verification.
- Officers remain responsible for final decisions.
- Editable outputs are preferred over fully automated decisions.
- Human-AI collaboration increases adoption.

### How It Influenced CaseCraftAI

CaseCraftAI follows a Human-in-the-Loop design. Every AI-generated FIR, legal recommendation, and investigation document can be reviewed, edited, and approved by the investigating officer before becoming part of the official case record.



# 6. Proposed Solution

## 6.1 Solution Overview

CaseCraftAI is an AI-assisted crime documentation and legal intelligence platform designed to support police officers throughout the investigation process. Instead of functioning as an autonomous decision-maker, the platform acts as an intelligent assistant that simplifies documentation, reduces repetitive administrative work, and provides legally grounded recommendations.

The system combines Retrieval-Augmented Generation (RAG), Large Language Models (LLMs), and structured document generation to assist officers in analyzing complaints, identifying applicable legal provisions, preparing FIR drafts, generating investigation documents, and maintaining a digital case diary.

By retrieving relevant legal information from a curated knowledge base before generating responses, CaseCraftAI minimizes hallucinations and ensures that recommendations are supported by official legal references. Every AI-generated output remains editable and requires officer approval before becoming part of the official case record.

The platform aims to improve efficiency, consistency, and accuracy while allowing investigating officers to retain complete control over all legal decisions.


## 6.2 Objectives

The primary objectives of CaseCraftAI are:

- Reduce the time required for preparing FIRs and investigation documents.
- Assist officers in identifying relevant legal sections using AI.
- Improve consistency and completeness in police documentation.
- Reduce repetitive manual work through document automation.
- Generate legally grounded recommendations using Retrieval-Augmented Generation (RAG).
- Maintain a structured digital case diary throughout the investigation lifecycle.
- Keep officers in complete control by ensuring every AI-generated output can be reviewed, edited, and approved before final submission.


## 6.3 Core Features

### 1. AI-Assisted Complaint Analysis

The system analyzes the complaint submitted by the investigating officer and extracts relevant information required for further legal processing. Instead of manually studying lengthy complaint descriptions, officers receive a structured summary that forms the foundation for subsequent legal analysis.

---

### 2. Legal Section Recommendation

The platform implements a Retrieval-Augmented Generation (RAG) pipeline to recommend applicable legal provisions.

The complaint summary is converted into a semantic embedding using the **intfloat/multilingual-e5-large** embedding model. The embedding is searched against a PostgreSQL database using the **pgvector** extension to retrieve the most relevant legal sections and landmark judgments.

These retrieved records are then provided to **Llama 3.2**, running locally through **Ollama**, which reranks the retrieved candidates and generates explanations for every recommendation before presenting them to the investigating officer.

---

### 3. AI-Generated FIR Draft

Based on the complaint details and retrieved legal context, the system generates a structured First Information Report (FIR) draft. Officers can review, edit, and finalize the generated draft before submission, ensuring that the final document remains under human supervision.

---

### 4. Automated Investigation Document Generation

The platform assists officers by generating investigation documents using predefined templates. For the MVP, the following documents are supported:

- Seizure Receipt
- Medical Treatment Letter
- Remand Request
- Accused Panchanama

Each document is generated using the case information already collected during complaint registration, reducing repetitive manual work.

---

### 5. Digital Case Diary

CaseCraftAI maintains a structured digital case diary that records important events throughout the investigation. Officers can track the progress of the case, generated documents, AI recommendations, and investigation updates from a single interface.

---

### 6. Human-in-the-Loop Review

Every AI-generated recommendation and document remains editable. The investigating officer reviews, modifies (if required), and approves all outputs before they become part of the official case record. This ensures that AI functions as an assistive tool rather than an autonomous decision-maker.

---

### 7. PDF Export

After review and approval, generated documents can be exported as PDF files for official use, printing, or digital record keeping.


## 6.4 Future Scope

The current implementation focuses on providing a functional MVP for AI-assisted crime documentation. Several additional capabilities can be incorporated in future versions of the platform, including:

- Audio-based complaint registration using speech-to-text.
- Multi-language complaint support and document generation.
- Evidence and attachment management.
- Charge Sheet generation.
- Integration with police databases and e-FIR systems.
- Investigation timeline visualization.
- AI-assisted evidence summarization.
- Analytics dashboard for case management.
- Secure role-based access for police personnel.
- Integration with national crime record systems and legal databases.


## 6.5 System Workflow

CaseCraftAI follows a structured workflow that assists investigating officers from complaint registration to document generation while ensuring that every AI-generated output remains under human supervision.

The complete workflow is described below:

### Step 1 – Complaint Registration

The investigating officer creates a new case using the Complaint Wizard. During this step, the system collects all essential case information, including:

- Complaint Details
- Complainant Details
- Victim Details
- Suspect Details
- Incident Details

Once completed, the information is submitted to the backend for further processing.

---

### Step 2 – Complaint Ingestion

The backend validates the submitted information, generates a unique Case ID, and stores all collected information in the Case Data Pool. This centralized data repository acts as the primary source of information for all subsequent modules.

---

### Step 3 – AI-Based Legal Analysis

The complaint summary is forwarded to the AI analysis module.

The complaint summary is converted into a semantic embedding using the multilingual-e5-large SentenceTransformer model. This embedding represents the semantic meaning of the complaint and is used for similarity-based retrieval from the legal knowledge base.

---

### Step 4 – Legal Knowledge Retrieval (RAG)

The generated embedding is compared against vector embeddings stored within PostgreSQL using the pgvector extension.

The retrieval stage returns the most relevant legal sections (BNS, BNSS, and BSA) together with curated landmark judgments.

These retrieved records are supplied as context to Llama 3.2, running locally through Ollama, which reranks the candidates, filters irrelevant results, and generates explanations for each recommendation.

This Retrieval-Augmented Generation workflow grounds AI responses in trusted legal references while minimizing hallucinations.

---

### Step 5 – FIR Draft Generation

Using the complaint details together with the retrieved legal context, the AI generates:

- Crime Category
- Applicable Legal Sections
- Explanation for each recommended section
- Structured FIR Draft

These outputs serve as the initial draft for officer review.

---

### Step 6 – Officer Review & Approval

Every AI-generated recommendation is presented to the investigating officer for verification.

The officer can:

- Review recommendations
- Modify generated content
- Edit the FIR draft
- Approve the final version

This Human-in-the-Loop workflow ensures that all legal decisions remain under officer supervision.

---

### Step 7 – Investigation Document Generation

Once the FIR is approved, the system generates investigation documents using predefined templates and the information already available in the Case Data Pool.

For the MVP, the following documents are supported:

- Seizure Receipt
- Medical Treatment Letter
- Remand Request
- Accused Panchanama

---

### Step 8 – Digital Case Diary

All important investigation events, AI recommendations, generated documents, and case updates are recorded within a structured digital case diary.

This enables officers to maintain a centralized record of the investigation throughout the case lifecycle.

---

### Step 9 – Export & Record Management

Approved documents can be exported as PDF files for printing, submission, or digital record keeping.

The completed case remains stored within the system for future reference and further investigation.


## 6.6 System Architecture

CaseCraftAI follows a modular architecture where each component performs a specific responsibility while communicating through well-defined APIs. This modular approach improves scalability, maintainability, and simplifies future enhancements.

The system consists of the following major components:

### 1. Frontend

The frontend serves as the primary interface for investigating officers. It provides a guided complaint registration workflow, displays AI-generated recommendations, allows document review, and enables document download.

Major responsibilities include:

- Complaint Registration Wizard
- Case Dashboard
- AI Result Visualization
- FIR Review & Editing
- Document Preview
- PDF Download

---

### 2. Backend Services

The backend acts as the central coordinator of the system. It receives complaint data, stores case information, communicates with the AI module, and coordinates document generation.

Major responsibilities include:

- Complaint Ingestion
- Case Data Management
- API Services
- Database Operations
- Integration between all modules

---

### 3. Case Data Pool

The Case Data Pool acts as the centralized repository for all investigation-related information.

It stores:

- Complaint Details
- Victim Information
- Suspect Information
- Officer Information
- AI Analysis Results
- Generated Documents
- Case Diary Entries

Since every module accesses this common dataset, duplicate data entry is avoided during document generation.

---

### 4. AI & Legal Intelligence Module

The AI module performs complaint understanding and legal reasoning.

Its responsibilities include:

- Semantic Complaint Embedding
- Vector Similarity Search
- Legal Section Retrieval
- Landmark Judgment Retrieval
- LLM-based Reranking
- Recommendation Explanation Generation

Rather than relying solely on a Large Language Model, the AI first retrieves relevant legal references from the knowledge base before generating responses.

The recommendation pipeline follows a two-stage retrieval process:

1. Semantic retrieval using pgvector to identify the most relevant legal sections and landmark judgments.

2. LLM-based reranking using Llama 3.2 through Ollama to select the most applicable results and generate human-readable explanations for each recommendation.

---

### 5. Legal Knowledge Base

The Legal Knowledge Base stores official legal references used by the Retrieval-Augmented Generation (RAG) pipeline.

The knowledge base currently contains:

- 1,059 legal sections
  - Bharatiya Nyaya Sanhita (BNS)
  - Bharatiya Nagarik Suraksha Sanhita (BNSS)
  - Bharatiya Sakshya Adhiniyam (BSA)

- 147 curated landmark judgments

Each legal section and landmark judgment is embedded as a single semantic record using the **intfloat/multilingual-e5-large** embedding model.

The embeddings are stored within PostgreSQL using the **pgvector** extension, allowing efficient semantic similarity search without requiring additional document chunking.

---

### 6. Document Generation Module

The Document Generation module creates investigation documents using predefined templates and information available within the Case Data Pool.

Initially supported documents include:

- Seizure Receipt
- Medical Treatment Letter
- Remand Request
- Accused Panchanama

Additional document types can be added without modifying the core system architecture.

---

### 7. Digital Case Diary

The Digital Case Diary records important investigation activities throughout the case lifecycle.

This includes:

- Complaint Registration
- AI Analysis
- Generated Documents
- Officer Actions
- Investigation Updates

The diary provides a chronological history of every significant event within a case.

---

### 8. PDF Export

After officer approval, generated documents can be exported as PDF files for official use, printing, and digital record keeping.

This module ensures that AI-generated content can be easily integrated into existing documentation workflows.


## 6.7 Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python

### Database
- PostgreSQL (Neon)

### ORM
- SQLAlchemy

### Database Migration
- Alembic

### AI Technologies
- Embedding Model: intfloat/multilingual-e5-large
- Large Language Model: Llama 3.2
- LLM Runtime: Ollama
- Vector Search: pgvector
- Retrieval Method: Semantic Similarity Search

### Document Generation
- docxtpl