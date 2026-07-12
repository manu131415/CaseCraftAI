import os
import requests
from dotenv import load_dotenv

load_dotenv()


HF_API_URL = "https://router.huggingface.co/hf-inference/models/intfloat/multilingual-e5-large/pipeline/feature-extraction"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")


def embed_query(text: str, max_retries: int = 3) -> list[float]:
    payload = {"inputs": f"query: {text}"}
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

    print("Token being used (first 10 chars):", HF_API_TOKEN[:10] if HF_API_TOKEN else "NONE")

    for attempt in range(max_retries):
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)

        if response.status_code == 503:
            continue

        if response.status_code != 200:
            print("HF error status:", response.status_code)
            print("HF error response:", response.text)

        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], float):
                return result
            if isinstance(result[0], list):
                if isinstance(result[0][0], float):
                    n = len(result)
                    dims = len(result[0])
                    return [sum(result[i][d] for i in range(n)) / n for d in range(dims)]

        raise ValueError(f"Unexpected embedding response shape: {result}")

    raise RuntimeError("Failed to get embedding from HF Inference API after retries")