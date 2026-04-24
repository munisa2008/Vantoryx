from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Config:
    bot_token: str
    api_base_url: str
    request_timeout_s: float = 15.0
    audio_poll_seconds: int = 60
    audio_poll_interval_s: float = 3.0


def load_config() -> Config:
    bot_token = (os.getenv("BOT_TOKEN") or "").strip()
    if not bot_token:
        raise RuntimeError("BOT_TOKEN is required")

    api_base_url = (os.getenv("API_BASE_URL") or "").strip().rstrip("/")
    if not api_base_url:
        raise RuntimeError("API_BASE_URL is required")

    request_timeout_s = float(os.getenv("REQUEST_TIMEOUT_S") or "15")
    audio_poll_seconds = int(os.getenv("AUDIO_POLL_SECONDS") or "60")
    audio_poll_interval_s = float(os.getenv("AUDIO_POLL_INTERVAL_S") or "3")

    return Config(
        bot_token=bot_token,
        api_base_url=api_base_url,
        request_timeout_s=request_timeout_s,
        audio_poll_seconds=audio_poll_seconds,
        audio_poll_interval_s=audio_poll_interval_s,
    )

