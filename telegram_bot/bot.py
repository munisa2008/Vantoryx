from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from dotenv import load_dotenv

from aiogram import Bot, Dispatcher, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.types import Message, CallbackQuery
from aiogram.types import InlineQuery, InlineQueryResultArticle, InputTextMessageContent

from config import load_config
from api_client import ApiClient
from keyboards import main_menu_kb, back_cancel_kb
from states import Flow
from formatting import (
    format_text_scam,
    format_link_analysis,
    format_what_to_reply,
    format_human_rewrite,
    format_reverse_phishing,
    format_audio_task,
)


log = logging.getLogger("vantoryx_bot")


def _hint(text: str) -> str:
    return f"{text}\n\n<i>Можно нажать «Назад в меню» или «Отмена».</i>"


def _inline_help_text() -> str:
    return (
        "<b>Inline режим</b>\n"
        "Пиши в любом чате: <code>@botname режим текст…</code>\n\n"
        "Режимы:\n"
        "• <code>ping</code>\n"
        "• <code>text</code> — анализ скама\n"
        "• <code>link</code> — анализ ссылок\n"
        "• <code>reply</code> — «что ответить?»\n"
        "• <code>rewrite</code> — честная версия\n"
        "• <code>reverse</code> — обратный фишинг\n\n"
        "Пример: <code>@botname text Вам заблокировали аккаунт…</code>"
    )


def _clip_inline(s: str, n: int = 3800) -> str:
    s = (s or "").strip()
    return s if len(s) <= n else s[: n - 1] + "…"


async def inline_mode(query: InlineQuery, api: ApiClient) -> None:
    q = (query.query or "").strip()

    if not q:
        await query.answer(
            results=[
                InlineQueryResultArticle(
                    id="help",
                    title="Как пользоваться inline режимом",
                    description="Набери: @бот режим текст…",
                    input_message_content=InputTextMessageContent(
                        message_text=_inline_help_text(),
                        parse_mode=ParseMode.HTML,
                        disable_web_page_preview=True,
                    ),
                )
            ],
            cache_time=1,
            is_personal=True,
        )
        return

    parts = q.split(maxsplit=1)
    mode = parts[0].lower()
    payload = parts[1] if len(parts) > 1 else ""

    async def _result(title: str, body_html: str, desc: str = "") -> InlineQueryResultArticle:
        return InlineQueryResultArticle(
            id=f"{mode}:{abs(hash(q))}",
            title=title,
            description=desc or _clip_inline(payload, 80),
            input_message_content=InputTextMessageContent(
                message_text=_clip_inline(body_html),
                parse_mode=ParseMode.HTML,
                disable_web_page_preview=True,
            ),
        )

    try:
        if mode == "ping":
            data = await api.ping()
            body = f"🟢 <b>Ping</b>\n<pre>{data}</pre>"
            await query.answer(results=[await _result("Ping API", body, "Проверка доступности")], cache_time=1, is_personal=True)
            return

        if mode == "text":
            data = await api.text_scam(payload)
            body = "🧠 <b>Проверка текста</b>\n\n" + format_text_scam(data)
            await query.answer(results=[await _result("Текст: скам?", body)], cache_time=1, is_personal=True)
            return

        if mode == "link":
            data = await api.link_analysis(payload)
            body = "🔗 <b>Проверка ссылок</b>\n\n" + format_link_analysis(data)
            await query.answer(results=[await _result("Ссылки: риск?", body)], cache_time=1, is_personal=True)
            return

        if mode == "reply":
            data = await api.what_to_reply(payload)
            body = "💬 <b>Что ответить?</b>\n\n" + format_what_to_reply(data)
            await query.answer(results=[await _result("Что ответить?", body)], cache_time=1, is_personal=True)
            return

        if mode == "rewrite":
            data = await api.human_rewrite(payload)
            body = "✍️ <b>Честная версия</b>\n\n" + format_human_rewrite(data)
            await query.answer(results=[await _result("Перепиши честно", body)], cache_time=1, is_personal=True)
            return

        if mode == "reverse":
            data = await api.reverse_phishing(payload)
            body = "🪤 <b>Обратный фишинг</b>\n\n" + format_reverse_phishing(data)
            await query.answer(results=[await _result("Обратный фишинг", body)], cache_time=1, is_personal=True)
            return

        # unknown mode
        await query.answer(
            results=[
                await _result(
                    "Неизвестный режим",
                    _inline_help_text(),
                    "Доступно: ping/text/link/reply/rewrite/reverse",
                )
            ],
            cache_time=1,
            is_personal=True,
        )
    except Exception as e:
        await query.answer(
            results=[
                InlineQueryResultArticle(
                    id=f"err:{abs(hash(q))}",
                    title="Ошибка запроса к API",
                    description=str(e)[:80],
                    input_message_content=InputTextMessageContent(
                        message_text=_clip_inline(f"🔴 <b>Ошибка</b>: <code>{e!s}</code>"),
                        parse_mode=ParseMode.HTML,
                        disable_web_page_preview=True,
                    ),
                )
            ],
            cache_time=1,
            is_personal=True,
        )


async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "Привет! Я бот для Vantoryx.\n"
        "Выберите что нужно:",
        reply_markup=main_menu_kb(),
    )


async def cmd_menu(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer("Меню.", reply_markup=main_menu_kb())


async def cmd_help(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(_inline_help_text(), reply_markup=main_menu_kb())


async def nav_menu(call: CallbackQuery, state: FSMContext) -> None:
    await call.answer()
    await state.clear()
    await call.message.answer("Меню.", reply_markup=main_menu_kb())


async def nav_cancel(call: CallbackQuery, state: FSMContext) -> None:
    await call.answer()
    await state.clear()
    await call.message.answer("Оке, отменено. Возвращаю в меню.", reply_markup=main_menu_kb())


async def on_menu_click(call: CallbackQuery, state: FSMContext, api: ApiClient) -> None:
    await call.answer()
    action = (call.data or "").split(":", 1)[1]

    if action == "help":
        await state.clear()
        await call.message.answer(_inline_help_text(), reply_markup=main_menu_kb())
        return

    if action == "ping":
        msg = await call.message.answer("⏳ Проверяю…")
        try:
            data = await api.ping()
            await msg.edit_text(f"🟢 Сервер работает", reply_markup=main_menu_kb())
        except Exception as e:
            await msg.edit_text(f"🔴 Ошибка", reply_markup=main_menu_kb())
        return

    if action == "text":
        await state.set_state(Flow.waiting_text_scam)
        await call.message.answer(_hint("🧠 Пришли текст для проверки на скам."), reply_markup=back_cancel_kb())
        return

    if action == "link":
        await state.set_state(Flow.waiting_link_text)
        await call.message.answer(_hint("🔗 Пришли текст, где есть ссылка(и)."), reply_markup=back_cancel_kb())
        return

    if action == "reply":
        await state.set_state(Flow.waiting_what_to_reply)
        await call.message.answer(_hint("💬 Пришли входящее сообщение — сгенерирую безопасный ответ."), reply_markup=back_cancel_kb())
        return

    if action == "rewrite":
        await state.set_state(Flow.waiting_human_rewrite)
        await call.message.answer(_hint("✍️ Пришли подозрительный текст — перепишу в честный вариант."), reply_markup=back_cancel_kb())
        return

    if action == "reverse":
        await state.set_state(Flow.waiting_reverse_phishing)
        await call.message.answer(_hint("🪤 Пришли подозрительный текст — сгенерирую безопасный тянущий время ответ + самопроверку."), reply_markup=back_cancel_kb())
        return

    if action == "audio":
        await state.set_state(Flow.waiting_audio_file)
        await call.message.answer(
            _hint("🎙 Пришли voice/audio/файл аудио. Я загружу в систему и подожду результат."),
            reply_markup=back_cancel_kb(),
        )
        return

    await call.message.answer("Неизвестная команда. Открой меню.", reply_markup=main_menu_kb())


async def handle_text_scam(message: Message, state: FSMContext, api: ApiClient) -> None:
    text = (message.text or "").strip()
    if not text:
        await message.answer(_hint("Пусто. Пришли текст."), reply_markup=back_cancel_kb())
        return
    wait = await message.answer("⏳ Анализирую…", reply_markup=back_cancel_kb())
    try:
        data = await api.text_scam(text)
        await wait.edit_text(format_text_scam(data), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка: <code>{e!s}</code>", reply_markup=back_cancel_kb())


async def handle_link_text(message: Message, state: FSMContext, api: ApiClient) -> None:
    text = (message.text or "").strip()
    if not text:
        await message.answer(_hint("Пусто. Пришли текст со ссылкой."), reply_markup=back_cancel_kb())
        return
    wait = await message.answer("⏳ Проверяю ссылки…", reply_markup=back_cancel_kb())
    try:
        data = await api.link_analysis(text)
        await wait.edit_text(format_link_analysis(data), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка: <code>{e!s}</code>", reply_markup=back_cancel_kb())


async def handle_what_to_reply(message: Message, state: FSMContext, api: ApiClient) -> None:
    text = (message.text or "").strip()
    if not text:
        await message.answer(_hint("Пусто. Пришли входящее сообщение."), reply_markup=back_cancel_kb())
        return
    wait = await message.answer("⏳ Генерирую безопасный ответ…", reply_markup=back_cancel_kb())
    try:
        data = await api.what_to_reply(text)
        await wait.edit_text(format_what_to_reply(data), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка: <code>{e!s}</code>", reply_markup=back_cancel_kb())


async def handle_human_rewrite(message: Message, state: FSMContext, api: ApiClient) -> None:
    text = (message.text or "").strip()
    if not text:
        await message.answer(_hint("Пусто. Пришли подозрительный текст."), reply_markup=back_cancel_kb())
        return
    wait = await message.answer("⏳ Переписываю…", reply_markup=back_cancel_kb())
    try:
        data = await api.human_rewrite(text)
        await wait.edit_text(format_human_rewrite(data), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка: <code>{e!s}</code>", reply_markup=back_cancel_kb())


async def handle_reverse_phishing(message: Message, state: FSMContext, api: ApiClient) -> None:
    text = (message.text or "").strip()
    if not text:
        await message.answer(_hint("Пусто. Пришли подозрительный текст."), reply_markup=back_cancel_kb())
        return
    wait = await message.answer("⏳ Генерирую ответ + самопроверку…", reply_markup=back_cancel_kb())
    try:
        data = await api.reverse_phishing(text)
        await wait.edit_text(format_reverse_phishing(data), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка: <code>{e!s}</code>", reply_markup=back_cancel_kb())


async def handle_audio(message: Message, state: FSMContext, api: ApiClient, *, poll_seconds: int, poll_interval_s: float) -> None:
    file_id = None
    filename = "audio"
    content_type = "application/octet-stream"

    if message.voice:
        file_id = message.voice.file_id
        filename = "voice.ogg"
        content_type = "audio/ogg"
    elif message.audio:
        file_id = message.audio.file_id
        filename = (message.audio.file_name or "audio.mp3")
        content_type = (message.audio.mime_type or content_type)
    elif message.document:
        file_id = message.document.file_id
        filename = (message.document.file_name or "audio.bin")
        content_type = (message.document.mime_type or content_type)

    if not file_id:
        await message.answer(_hint("Нужен voice/audio/document файл. Пришли аудио."), reply_markup=back_cancel_kb())
        return

    bot: Bot = message.bot
    wait = await message.answer("⏳ Скачиваю файл…", reply_markup=back_cancel_kb())
    tg_file = await bot.get_file(file_id)
    data = await bot.download_file(tg_file.file_path)
    raw = data.read()

    await wait.edit_text("⏳ Загружаю в систему…", reply_markup=back_cancel_kb())
    try:
        created = await api.create_audio_task(filename=filename, content_type=content_type, data=raw)
        task_id = int(created.get("id"))
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка загрузки: <code>{e!s}</code>", reply_markup=back_cancel_kb())
        return

    await wait.edit_text(f"⏳ Задача создана: <code>{task_id}</code>. Жду результат…", reply_markup=back_cancel_kb())
    try:
        result = await api.wait_audio_result(task_id, poll_seconds=poll_seconds, interval_s=poll_interval_s)
        await wait.edit_text(format_audio_task(result), reply_markup=back_cancel_kb())
    except Exception as e:
        await wait.edit_text(f"🔴 Ошибка получения результата: <code>{e!s}</code>", reply_markup=back_cancel_kb())


def build_dispatcher(api: ApiClient, *, poll_seconds: int, poll_interval_s: float) -> Dispatcher:
    dp = Dispatcher()

    dp.message.register(cmd_start, CommandStart())
    dp.message.register(cmd_menu, Command("menu"))
    dp.message.register(cmd_help, Command("help"))

    async def _inline(q: InlineQuery) -> None:
        await inline_mode(q, api)

    dp.inline_query.register(_inline)

    dp.callback_query.register(nav_menu, F.data == "nav:menu")
    dp.callback_query.register(nav_cancel, F.data == "nav:cancel")

    async def _menu_click(call: CallbackQuery, state: FSMContext) -> None:
        await on_menu_click(call, state, api)

    dp.callback_query.register(_menu_click, F.data.startswith("m:"))

    async def _text_scam(m: Message, state: FSMContext) -> None:
        await handle_text_scam(m, state, api)

    async def _link_text(m: Message, state: FSMContext) -> None:
        await handle_link_text(m, state, api)

    async def _what_to_reply(m: Message, state: FSMContext) -> None:
        await handle_what_to_reply(m, state, api)

    async def _human_rewrite(m: Message, state: FSMContext) -> None:
        await handle_human_rewrite(m, state, api)

    async def _reverse_phishing(m: Message, state: FSMContext) -> None:
        await handle_reverse_phishing(m, state, api)

    dp.message.register(_text_scam, Flow.waiting_text_scam)
    dp.message.register(_link_text, Flow.waiting_link_text)
    dp.message.register(_what_to_reply, Flow.waiting_what_to_reply)
    dp.message.register(_human_rewrite, Flow.waiting_human_rewrite)
    dp.message.register(_reverse_phishing, Flow.waiting_reverse_phishing)

    async def _audio_wrapper(m: Message, s: FSMContext):
        await handle_audio(m, s, api, poll_seconds=poll_seconds, poll_interval_s=poll_interval_s)

    dp.message.register(_audio_wrapper, Flow.waiting_audio_file)

    return dp


async def main() -> None:
    load_dotenv()
    cfg = load_config()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    bot = Bot(
        token=cfg.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    api = ApiClient(base_url=cfg.api_base_url, timeout_s=cfg.request_timeout_s)
    dp = build_dispatcher(api, poll_seconds=cfg.audio_poll_seconds, poll_interval_s=cfg.audio_poll_interval_s)

    log.info("Bot started. API base=%s", cfg.api_base_url)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())

