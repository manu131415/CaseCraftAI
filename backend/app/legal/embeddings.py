"""
Lightweight wrapper around Voyage AI's hosted embeddings API.

Why `voyage-law-2`:
- Native output dimension is 1024 -- matches the `embedding VECTOR(1024)`
  column on `legal_sections` exactly. No truncation or padding needed.
- It's trained specifically for legal retrieval (statutes, case law), which
  fits this domain better than a general-purpose embedding model.
- It's a hosted API call -- nothing to deploy, no model weights to keep warm.

Setup:
    pip install voyageai
    export VOYAGE_API_KEY=...   (get one at https://dashboard.voyageai.com)

If you'd rather use a different provider (e.g. Cohere's `embed-english-v3.0`,
also natively 1024-dim), this is the only file that needs to change -- the
rest of the app just calls `embed_query` / `embed_documents`.
"""

import os
from functools import lru_cache
from typing import List

import voyageai

EMBEDDING_MODEL = "voyage-law-2"
EMBEDDING_DIMENSIONS = 1024


@lru_cache(maxsize=1)
def _client() -> voyageai.Client:
    api_key = os.environ.get("VOYAGE_API_KEY")
    if not api_key:
        raise RuntimeError("VOYAGE_API_KEY is not set")
    return voyageai.Client(api_key=api_key)


def embed_query(text: str) -> List[float]:
    """Embed a single search query. Uses input_type='query', which Voyage's
    retrieval models use to apply a slightly different encoding than for
    documents -- improves relevance vs. embedding query and document the
    same way."""
    result = _client().embed([text], model=EMBEDDING_MODEL, input_type="query")
    return result.embeddings[0]


def embed_documents(texts: List[str]) -> List[List[float]]:
    """Embed a batch of section texts, e.g. for the backfill script."""
    result = _client().embed(texts, model=EMBEDDING_MODEL, input_type="document")
    return result.embeddings