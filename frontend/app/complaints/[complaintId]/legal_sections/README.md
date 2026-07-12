# Legal Section Intelligence

NLP-based module that analyzes a complaint's case summary and recommends:
- Relevant sections under **BNS, BNSS, BSA**
- Applicable **landmark judgments**
- Cross-referenced **IPC / CrPC / Evidence Act** provisions where those sections have new-law equivalents

## How it works

```
Case summary (complaint.description or manual input)
        │
        ▼
  embed_query()  ──  intfloat/multilingual-e5-large (lazy-loaded, cached)
        │
        ▼
  pgvector cosine-distance search
        │
        ├── top 20 candidates from `legal_sections`
        └── top 10 candidates from `landmarks`
        │
        ▼
  LLM reranking  ──  Ollama (llama3.2:3b)
        │  selects + ranks only the truly relevant candidates
        ▼
  Cross-reference lookup
        │  each selected section matched against `legal_section_mappings`
        │  (BNS↔IPC, BNSS↔CrPC, BSA↔IEA) via word-boundary regex
        ▼
  JSON response → rendered by frontend page
```

## Files

| File | Purpose |
|---|---|
| `backend/app/apis/legal_section_intelligence.py` | Router: retrieval, reranking, cross-referencing, response assembly |
| `backend/app/core/embeddings.py` | Lazily-loaded, cached `SentenceTransformer` shared across requests |
| `frontend/app/complaints/[complaintId]/legal_sections/page.tsx` | UI: fetches analysis, renders section/judgment cards, editable case-summary fallback |

## API

### `POST /api/complaints/{complaint_id}/legal-sections/analyze`

**Request body** (optional — omit or pass `null` to auto-fetch from the complaint's `description` column):
```json
{ "case_summary": "string | null" }
```

**Response**
```json
{
  "complaint_id": "COMP001",
  "case_summary": "...",
  "sections": [
    {
      "id": "uuid",
      "act_code": "BNS",
      "section_number": "319",
      "title": "Cheating by personation",
      "section_text": "...",
      "category": "...",
      "similarity": 0.778,
      "reason": "why the LLM ranked this relevant",
      "cross_references": [
        { "act": "IPC", "section": "416", "subject": "...", "summary_of_comparison": "..." }
      ]
    }
  ],
  "judgments": [
    {
      "id": "uuid",
      "case_title": "...",
      "court": "...",
      "case_date": "2024-08-07",
      "ipc_sections": "['120B', '489B']",
      "crime_type": "...",
      "summary": "...",
      "judgment_reason": "...",
      "bail_outcome": "Rejected",
      "similarity": 0.76,
      "reason": "why the LLM ranked this relevant"
    }
  ]
}
```

**Status codes**
| Code | Meaning |
|---|---|
| 200 | Success |
| 404 | `complaint_id` not found |
| 422 | No `case_summary` available (complaint has no `description`, and none was supplied in the body) — frontend shows an editable textarea in this case |
| 500 | Retrieval, embedding, DB, or Ollama failure — `detail` includes exception type and message |

## Setup

**Environment**
- Backend: `dataset/.env` must contain `DATABASE_URL` (existing convention from `database/db.py`)
- Frontend: `frontend/.env.local`:
  ```
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
  ```
  (no `/api` suffix — it's already part of the fetch path in `page.tsx`)

**Database**
- `pgvector` extension must be enabled:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- `legal_sections.embedding` / `landmarks.embedding` must already be populated (this endpoint only *reads* them, it doesn't generate embeddings for those tables)

**Ollama**
- `ollama serve` running locally on port `11434`
- Model pulled: `ollama pull llama3.2:3b`
- First request after Ollama starts is slow (model load into memory) — the request timeout is set to 300s to accommodate this

**Register the router** in `main.py`:
```python
from app.apis.legal_section_intelligence import router as legal_section_intelligence_router
...
app.include_router(legal_section_intelligence_router)
```

## Testing

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/complaints/COMP001/legal-sections/analyze" `
  -Method Post -ContentType "application/json" -Body '{}'
```
or via FastAPI's interactive docs at `http://localhost:8000/docs` → `legal-section-intelligence` → `POST /api/complaints/{complaint_id}/legal-sections/analyze` → **Try it out**.

Frontend: `http://localhost:3000/complaints/{complaint_id}/legal_sections`

## Known issues / follow-ups

- **`models/complaint.py` schema drift**: the model declares `complaint_type`, `category`, and `priority` columns that don't exist in the live `complaints` table, which breaks any query that loads the full `Complaint` ORM entity. This endpoint works around it by selecting only `complaint_id` and `description` directly rather than loading the full model — but other endpoints touching `Complaint` will still fail until the model and table are reconciled. Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'complaints';` to get the real column list and either migrate the table or trim the model.
- **`models/_types.py`'s `Vector` type has no query-side comparator** (no `.cosine_distance()`, unlike `pgvector.sqlalchemy.Vector`). Distance queries are built with `literal_column()` and a manually-formatted vector literal (`'[0.1,0.2,...]'::vector`) instead. This is safe from injection since the literal is built entirely from model-generated floats, never user input — but if `models/_types.py` is ever swapped for the real `pgvector.sqlalchemy.Vector`, this can be simplified back to `.cosine_distance()`.
- **Cross-reference matching** assumes `legal_section_mappings.new_section`/`old_section` contain the target section number as a standalone token within free text (matched via Postgres word-boundary regex `\y...\y`). If a mapping row ever formats sections differently (e.g. `"Sec. 302"` instead of `"302"`), that row won't match — worth spot-checking a few rows if cross-references seem sparse for a given act.
- **Ollama reranking has no retry/fallback**: if the Ollama call times out or returns malformed JSON, the endpoint currently returns an empty `sections`/`judgments` list rather than falling back to raw similarity-ranked results. Consider adding a fallback path (return top-N by similarity, unranked) if this proves too fragile in practice.
- **No caching**: every call re-embeds the case summary and re-queries the LLM, even for the same complaint. If this gets called repeatedly (e.g. every time the page loads), consider caching the last result per `complaint_id` (in a `recommendations` table, matching the resource you already have registered in `main.py`) instead of re-running the full pipeline each time.