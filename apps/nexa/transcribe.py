from __future__ import annotations
import threading
from faster_whisper import WhisperModel

_MODEL_LOCK = threading.Lock()
_MODEL = None

def _get_model(model_name: str = "base"):
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                _MODEL = WhisperModel(
                    model_name,
                    device="cpu",
                    compute_type="int8",  
                    cpu_threads=8,       
                    num_workers=2,        
                )
    return _MODEL

def transcribe_with_whisper_local(file_path: str, language: str = "ru", model_name: str = "base") -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)

    model = _get_model(model_name)
    segments, info = model.transcribe(
        file_path,
        language=language,
        fp16=False,
        verbose=False,
        # temperature=0.0,
        # condition_on_previous_text=False,
    )

    text = (result.get("text") or "").strip()
    return text
