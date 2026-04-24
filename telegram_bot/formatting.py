from __future__ import annotations

from typing import Any


def _clip(s: str, n: int) -> str:
    s = (s or "").strip()
    return s if len(s) <= n else s[: n - 1] + "…"


def as_pretty_json(data: Any) -> str:
    import json

    return json.dumps(data, ensure_ascii=False, indent=2)


def format_text_scam(result: dict) -> str:
    verdict = result.get("verdict", "uncertain")
    score = result.get("risk_score", 0)
    reasons = result.get("reasons") or []
    expl = result.get("short_explanation", "")
    emoji = {"scam": "🔴", "safe": "🟢", "uncertain": "🟡"}.get(verdict, "🟡")

    parts = [
        f"{emoji} <b>Вердикт</b>: <code>{verdict}</code>",
        f"📈 <b>Риск</b>: <code>{score}</code>/100",
    ]
    if reasons:
        parts.append("🧩 <b>Причины</b>:\n" + "\n".join(f"• {_clip(str(x), 160)}" for x in reasons[:6]))
    if expl:
        parts.append("📝 <b>Коротко</b>:\n" + _clip(str(expl), 600))
    return "\n\n".join(parts)


def format_link_analysis(result: dict) -> str:
    verdict = result.get("verdict", "unknown")
    score = result.get("risk_score", 0)
    urls = result.get("extracted_urls") or []
    ai_conc = result.get("ai_conclusion", "")
    emoji = {"danger": "🔴", "neutral": "🟢", "unknown": "🟡"}.get(verdict, "🟡")

    parts = [
        f"{emoji} <b>Вердикт</b>: <code>{verdict}</code>",
        f"📈 <b>Риск</b>: <code>{score}</code>/100",
    ]
    if urls:
        parts.append("🔎 <b>Найдено URL</b>:\n" + "\n".join(f"• <code>{_clip(u, 140)}</code>" for u in urls[:10]))
    if ai_conc:
        parts.append("🤖 <b>AI вывод</b>:\n" + _clip(str(ai_conc), 700))
    return "\n\n".join(parts)


def format_what_to_reply(result: dict) -> str:
    msg = result.get("reply_message", "")
    dont = result.get("dont_do") or []
    parts = [
        "💬 <b>Безопасный ответ</b>:\n" + _clip(str(msg), 400),
    ]
    if dont:
        parts.append("✅ <b>Что не делать</b>:\n" + "\n".join(f"• {_clip(str(x), 180)}" for x in dont[:10]))
    return "\n\n".join(parts)


def format_human_rewrite(result: dict) -> str:
    honest = result.get("honest_version", "")
    flags = result.get("red_flags") or []
    parts = ["✍️ <b>Честная версия</b>:\n" + _clip(str(honest), 400)]
    if flags:
        parts.append("🚩 <b>Ред-флаги</b>:\n" + "\n".join(f"• {_clip(str(x), 180)}" for x in flags[:6]))
    return "\n\n".join(parts)


def format_reverse_phishing(result: dict) -> str:
    msg = result.get("reply_message", "")
    verdict = result.get("self_check_verdict", "uncertain")
    issues = result.get("self_check_issues") or []
    emoji = {"safe": "🟢", "leaky": "🔴", "uncertain": "🟡"}.get(verdict, "🟡")

    parts = [
        "🪤 <b>Ответ (безопасный, тянет время)</b>:\n" + _clip(str(msg), 420),
        f"{emoji} <b>Самопроверка</b>: <code>{verdict}</code>",
    ]
    if issues:
        parts.append("🔍 <b>Проблемы</b>:\n" + "\n".join(f"• {_clip(str(x), 180)}" for x in issues[:6]))
    return "\n\n".join(parts)


def format_audio_task(result: dict) -> str:
    status = result.get("status", "")
    summary = result.get("summary", "")
    transcript = result.get("transcription", "")
    parts = [f"🎙 <b>Статус</b>: <code>{status}</code>"]
    if summary:
        parts.append("🧾 <b>Вердикт</b>:\n" + _clip(str(summary), 200))
    if transcript:
        parts.append("📝 <b>Транскрипция</b>:\n" + _clip(str(transcript), 1200))
    return "\n\n".join(parts)

