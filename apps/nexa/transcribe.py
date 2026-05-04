from __future__ import annotations

import os
import threading
import numpy as np
from faster_whisper import WhisperModel

_MODEL_LOCK = threading.Lock()
_MODEL = None

def _get_model(model_name: str = "tiny"):
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                _MODEL = WhisperModel(
                    model_name,
                    device="cpu",
                    compute_type="int8",
                    cpu_threads=2,   
                    num_workers=1,
                )
    return _MODEL

def warmup_model(model_name: str = "tiny") -> None:
    """Pre-run inference on silence to JIT-warm the model."""
    model = _get_model(model_name)
    silence = np.zeros(16000, dtype=np.float32)
    list(model.transcribe(silence, language="ru", beam_size=1)[0])

def transcribe_with_whisper_local(file_path: str, language: str = "ru", model_name: str = "tiny") -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)

    model = _get_model(model_name)
    segments, _ = model.transcribe(
        file_path,
        language=language,
        beam_size=1,                      
        best_of=1,
        vad_filter=True,                 
        vad_parameters={"min_silence_duration_ms": 200, "speech_pad_ms": 100},
        condition_on_previous_text=False, 
        without_timestamps=True,
    )
    return " ".join(s.text for s in segments).strip()
