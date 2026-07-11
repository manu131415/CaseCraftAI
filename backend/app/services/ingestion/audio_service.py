import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict


def extract_audio_text(audio_path: str) -> Dict[str, Any]:
    audio_file = Path(audio_path)
    if not audio_file.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    try:
        import whisper
    except Exception as exc:
        return {
            "text": "",
            "error": f"Whisper is not installed: {exc}",
            "transcript": "",
        }

    model = whisper.load_model("base")
    result = model.transcribe(str(audio_file), fp16=False)
    transcript = result.get("text", "")
    return {
        "text": transcript,
        "transcript": transcript,
        "language": result.get("language", "unknown"),
    }
