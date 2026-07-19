# Legal Section Intelligence — RAG Pipeline (Complete Flow)

This document traces exactly what happens, file by file, from a police
officer submitting a case summary to the frontend rendering ranked sections
and judgments, and from there to saving/downloading an FIR draft.

It reflects the code as written, cross-checked against the seeding scripts
(`seed_db.py`, `seed_landmarks.py`) that originally populated the vector
columns. Embedding generation at query time and at ingestion time use the
same model and encoding path, so retrieval is consistent end to end. A
couple of minor cleanup notes are collected in **Known Issues / Follow-ups**
at the end — none of them affect current correctness.

---

## 1. End-to-end flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                            │
│  legal_sections/page.tsx                                             │
│  POST /api/complaints/{complaintId}/legal-sections/analyze           │
│  body: { case_summary: string | null }                               │
└───────────────────────────────┬───────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND ROUTER                                                       │
│  app/apis/legal_section_intelligence.py                              │
│  1. Resolve case_summary                                             │
│     - if body.case_summary given → use it                            │
│     - else → fetch complaint.description from DB                     │
│     - if neither exists → 422 (frontend shows manual textarea)       │
│  2. Call get_recommendations(case_summary)                           │
└───────────────────────────────┬───────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RETRIEVAL PIPELINE — retrieve.py :: get_recommendations()           │
└───────────────────────────────┬───────────────────────────────────┘
                                 ▼
              ┌──────────────────────────────────┐
              │ Step A — Embed the query          │
              │ retrieve.py :: embed_query()       │
              │ SentenceTransformer, LOCAL model   │
              └──────────────────┬────────────────┘
                                 ▼
              ┌──────────────────────────────────┐
              │ Step B — Vector search (pgvector)  │
              │ retrieve.py :: retrieve_candidates()│
              │ - top 20 legal_sections            │
              │ - top 10 landmarks                 │
              │ ORDER BY embedding <=> query_vec    │
              └──────────────────┬────────────────┘
                                 ▼
              ┌──────────────────────────────────┐
              │ Step C — LLM reranking             │
              │ retrieve.py :: rerank_with_llm()   │
              │ Groq (openai/gpt-oss-20b),         │
              │ forced JSON-schema output          │
              │ → keeps only truly relevant items, │
              │   attaches a "reason" per item      │
              └──────────────────┬────────────────┘
                                 ▼
              ┌──────────────────────────────────┐
              │ Step D — Cross-reference lookup    │
              │ section_mapping.py                 │
              │ enrich_sections_with_cross_references│
              │ BNS↔IPC / BNSS↔CrPC / BSA↔IEA      │
              │ via regex word-boundary match on    │
              │ legal_section_mappings table        │
              └──────────────────┬────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND ROUTER assembles JSON response:                             │
│  { complaint_id, case_summary, sections[], judgments[] }             │
└───────────────────────────────┬───────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND renders SectionCard / JudgmentCard, officer selects items,  │
│  clicks "Save FIR draft" → POST /api/fir-drafts                      │
│  → app/apis/fir_drafts.py inserts a new fir_drafts row (append-only) │
│  → officer clicks "Download DOCX" → GET /api/fir-drafts/{id}/download│
│  → fir_document_generator.build_fir_docx() streams a .docx back      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-step, file by file

### 2.1 Case summary resolution — `legal_section_intelligence.py`

The frontend always POSTs to `/api/complaints/{complaint_id}/legal-sections/analyze`.
If the officer hasn't typed anything, the body carries `case_summary: null` and
the router is expected to fall back to the complaint's stored `description`
column. If that's also empty, it returns `422`, which `page.tsx` interprets
as "show me a manual textarea" (`needsManualSummary`).

### 2.2 Embedding — `embed_query()`

```python
model = SentenceTransformer('intfloat/multilingual-e5-large')  # loaded once, at import time

def embed_query(text: str):
    return model.encode(f"query: {text}").tolist()
```

The `"query: "` prefix is required by e5-family models to distinguish query
embeddings from passage embeddings. This matches how the data was ingested:
both `seed_db.py` (for `legal_sections`) and `seed_landmarks.py` (for
`landmarks`) embed with the same model, `intfloat/multilingual-e5-large`,
via the same `SentenceTransformer.encode()` call — just with a `"passage: "`
prefix instead of `"query: "`, which is exactly the intended query/passage
split for this model family. So query-time and ingestion-time embeddings
are produced consistently, and cosine similarity between them is meaningful.

Note: `embeddings.py` in the same codebase defines an alternate
`embed_query` that calls the Hugging Face Inference API instead of loading
the model locally. It's not imported or used anywhere in this pipeline —
`retrieve.py` defines its own `embed_query` and never references it. It's
effectively dead code (see Known Issues).

### 2.3 Vector retrieval — `retrieve_candidates()`

Two pgvector queries, both ordered by cosine distance:

```sql
SELECT id, act_code, section_number, title, section_text, category,
       1 - (embedding <=> %s::vector) AS similarity
FROM legal_sections
ORDER BY embedding <=> %s::vector
LIMIT 20
```

`<=>` is pgvector's cosine-distance operator; `1 - distance` converts it
back into an intuitive 0–1 similarity score, which is what the frontend's
`SimilarityBadge` renders as a percentage. The same pattern runs against
`landmarks` for judgments (top 10).

Note: this file talks to Postgres directly via `psycopg2`, not through the
SQLAlchemy `Vector` type in `_types.py` — that custom type (see §2.6) is
presumably used elsewhere (e.g. the ingestion pipeline that originally
populated these embedding columns), not in this read path.

### 2.4 LLM reranking — `rerank_with_llm()`

Both candidate lists are compressed into short indexed blurbs
(`[S0]`, `[S1]`, … / `[J0]`, `[J1]`, …, each truncated to 300 chars of body
text) and sent to Groq (`openai/gpt-oss-20b`) with a forced JSON schema
(`response_format: json_schema`) so the model can only return
`{ ref, relevance_reason }` pairs referencing those indices.

Reliability handling:
- **429** → sleeps for the `Retry-After` header value, retries (up to
  `max_retries`, default 3).
- **400** → assumed malformed request/JSON, retries.
- Local `json.loads` failure on the returned content → also retries (the
  model occasionally wraps output in ```` ```json ```` fences, which are
  stripped first).
- If every attempt fails, returns `([], [])` rather than raising — the
  analyze endpoint would then return empty `sections`/`judgments` arrays
  rather than a 500, and `page.tsx` shows "No relevant sections found."

Each surviving `ref` (e.g. `"S3"`) is parsed back to an integer index and
used to pull the *full* record (not the truncated blurb) from the original
candidate list, with `relevance_reason` attached as `reason` — this is the
string `SectionCard`/`JudgmentCard` show under each result.

Out-of-range or malformed refs are logged and skipped rather than raising,
so one bad ref from the LLM doesn't fail the whole request.

### 2.5 Cross-referencing — `section_mapping.py`

For every section that survived reranking, `enrich_sections_with_cross_references`
looks up old-law ⇄ new-law equivalents:

- If the section's `act_code` is one of the new laws (`BNS`, `BNSS`, `BSA`),
  it searches `legal_section_mappings` for rows where `new_act` matches and
  `new_section` contains the section number as a **whole word** (Postgres
  `~` regex with `\y` word-boundary anchors — this is Postgres's own regex
  dialect, not standard PCRE `\b`).
- If it's an old law (`IPC`, `CrPC`, `IEA`), the same lookup runs in
  reverse (`old_act`/`old_section`).
- Anything else (an unrecognized act code) short-circuits to an empty list.

The result — `{act, section, subject, summary_of_comparison}` per match —
becomes each section's `cross_references[]`, which `SectionCard` renders as
the "Corresponds to" badges with the comparison summary as a tooltip.

### 2.6 Ingestion — `seed_db.py`, `seed_landmarks.py`, `seed_mappings.py`

These are one-time/occasional scripts, not part of the live request path,
but they're what makes retrieval meaningful — worth documenting alongside
the query-time code they need to stay consistent with.

- **`seed_db.py`** loads the `GSMS-B/indian-legal-sections-bns-bnss-bsa-2023`
  dataset, normalizes each act string (`"BNS 2023"` → `"BNS"`), strips a
  `[Context: ...]` header from the section text before storing it (but keeps
  that header in the text used *for embedding*), and inserts into
  `legal_sections` with `ON CONFLICT (act_code, section_number) DO NOTHING`
  — safe to re-run without creating duplicates.
- **`seed_landmarks.py`** loads
  `SnehaDeshmukh/IndianBailJudgments-1200`, filters to only rows flagged
  `landmark_case` (toggle via `ONLY_LANDMARKS`), builds the embedding input
  by concatenating crime type, summary, judgment reason, legal issues, and
  legal principles, and inserts into `landmarks`. Unlike `seed_db.py`, there's
  no conflict handling — re-running it will insert duplicates.
- **`seed_mappings.py`** reads three CSVs (`BNS_to_IPC.csv`,
  `BNSS_to_CrPC.csv`, `BSA_to_IEA.csv`) and bulk-inserts them into
  `legal_section_mappings` via `execute_values`, with an optional
  `--truncate` flag to wipe the table first. This is the table
  `section_mapping.py` queries at request time for cross-references.

Both `seed_db.py` and `seed_landmarks.py` use the exact same embedding call
as `retrieve.py`'s `embed_query` (same model, same `SentenceTransformer.encode()`
path), just with the `"passage: "` prefix — which is why retrieval scores
are meaningful (see §2.2).

### 2.7 `_types.py` — the `Vector` column type

A minimal SQLAlchemy `UserDefinedType` that maps to Postgres's native
`VECTOR(n)` column type for DDL/ORM purposes. It has **no query-side
comparator** — no `.cosine_distance()`/`.l2_distance()` methods like the
real `pgvector.sqlalchemy.Vector` provides. This is why `retrieve.py`
bypasses the ORM entirely for similarity search and hand-writes raw SQL
with `<=>` instead. (Flagged in the original project README as a known
follow-up.)

### 2.8 Response assembly & frontend rendering

The router packages everything into the `AnalysisResult` shape `page.tsx`
expects:

```json
{
  "complaint_id": "...",
  "case_summary": "...",
  "sections": [ { ...section, similarity, reason, cross_references[] } ],
  "judgments": [ { ...judgment, similarity, reason } ]
}
```

`page.tsx` renders each into a `SectionCard`/`JudgmentCard`, lets the
officer check/uncheck items, and tracks selections in
`selectedSectionIds`/`selectedJudgmentIds`.

### 2.9 FIR draft persistence — `fir_drafts.py`

"Save FIR draft" POSTs the full selected section/judgment objects (not just
IDs) as `draft_content` to `/api/fir-drafts`, which inserts a new
`fir_drafts` row — every save is a fresh, independent row (append-only
history per complaint). "Download DOCX" then fetches
`/api/fir-drafts/{id}/download`, which renders the stored draft into the
FIR template via `build_fir_docx()` and streams it back as a file.

---

## 3. File map

| File | Role |
|---|---|
| `frontend/app/complaints/[complaintId]/legal_sections/page.tsx` | UI: triggers analysis, renders results, manages selection, saves/downloads FIR draft |
| `app/apis/legal_section_intelligence.py` | Router: resolves case summary, orchestrates the pipeline, assembles response |
| `retrieve.py` | Core pipeline: embed → pgvector search → LLM rerank → cross-reference → assemble |
| `embeddings.py` | Alternate (currently unused) HF-Inference-API embedding path |
| `section_mapping.py` | BNS/BNSS/BSA ⇄ IPC/CrPC/IEA cross-reference lookups |
| `models/_types.py` | Custom pgvector-backed SQLAlchemy column type (DDL only, no query comparator) |
| `seed_db.py` | One-time ingestion: populates `legal_sections` with embeddings |
| `seed_landmarks.py` | One-time ingestion: populates `landmarks` with embeddings |
| `seed_mappings.py` | One-time ingestion: populates `legal_section_mappings` from CSVs |
| `app/apis/fir_drafts.py` | Router: create/list/get/patch/delete FIR drafts, DOCX download |
| `app/schemas/fir_drafts.py` | Pydantic request/response models for FIR drafts |
| `models/fir_drafts.py` | SQLAlchemy model for the `fir_drafts` table |

---

## 4. Known issues / follow-ups

The pipeline works correctly end to end: ingestion and query-time embedding
use the same model and encoding path, retrieval and reranking behave as
designed, and cross-referencing correctly matches old/new act sections. The
items below are minor and optional — none of them are blocking anything.

- **`embeddings.py` is unused.** It defines an alternate `embed_query` that
  calls the Hugging Face Inference API, but nothing in the live pipeline
  imports it — `retrieve.py` has its own local-model implementation, which
  is the one actually in use and the one consistent with the seeding
  scripts. Fine to leave as-is, or delete/mark it clearly as legacy if it's
  not needed for anything else (e.g. a lighter-weight deployment target
  without local model weights).
- **Reranker failure and "no relevant results" currently look the same to
  the frontend.** If every retry of the Groq call fails, `rerank_with_llm`
  returns `([], [])`, same as a case that genuinely has no applicable
  sections — the officer sees "No relevant sections found" either way. This
  is a reasonable fallback (it fails soft rather than crashing the
  request), but if it turns out to matter in practice, a small optional
  improvement would be a `degraded: true` flag on the response so the
  frontend can distinguish "nothing applies" from "please retry."
- **No caching of recommendations yet** (already noted in the original
  project README) — every analyze call re-embeds and re-queries the LLM,
  even for a complaint just analyzed moments earlier. Purely a performance/
  cost optimization, not a correctness concern.
- **`_types.Vector` has no query-side comparator**, so similarity queries
  are hand-written SQL rather than going through the ORM (already noted in
  the original project README). Works fine as-is; only relevant if this
  ever needs to move onto the real `pgvector.sqlalchemy.Vector` type.