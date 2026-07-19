# app/services/doc_engine/translator.py

import json
from pathlib import Path


class Translator:

    def __init__(self):

        self.translation_dir = (
            Path(__file__).parent / "translations"
        )

        self.cache = {}

    def load(self, language: str = "en") -> dict:

        language = language.lower()

        if language not in ("en", "hi", "gu"):
            language = "en"

        if language in self.cache:
            return self.cache[language]

        file_path = (
            self.translation_dir /
            f"{language}.json"
        )

        with open(
            file_path,
            encoding="utf-8"
        ) as f:

            data = json.load(f)

        self.cache[language] = data

        return data