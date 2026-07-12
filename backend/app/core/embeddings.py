from functools import lru_cache

from sentence_transformers import SentenceTransformer

_MODEL_NAME = "intfloat/multilingual-e5-large"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Loaded once, on first use, and cached for the life of the process."""
    return SentenceTransformer(_MODEL_NAME)


def embed_query(text: str) -> list[float]:
    # e5 models need the "query: " prefix for search text (vs "passage: " used during ingestion)
    return get_embedding_model().encode(f"query: {text}").tolist()