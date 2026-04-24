from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder


def main_menu_kb() -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    kb.row(
        InlineKeyboardButton(text="🟢 Ping", callback_data="m:ping"),
        InlineKeyboardButton(text="🧠 Текст (скам?)", callback_data="m:text"),
    )
    kb.row(
        InlineKeyboardButton(text="🔗 Ссылки", callback_data="m:link"),
        InlineKeyboardButton(text="💬 Что ответить?", callback_data="m:reply"),
    )
    kb.row(
        InlineKeyboardButton(text="✍️ Перепиши честно", callback_data="m:rewrite"),
        InlineKeyboardButton(text="🪤 Обратный фишинг", callback_data="m:reverse"),
    )
    kb.row(InlineKeyboardButton(text="🎙 Аудио → анализ", callback_data="m:audio"))
    kb.row(InlineKeyboardButton(text="ℹ️ Помощь", callback_data="m:help"))
    return kb.as_markup()


def back_cancel_kb() -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    kb.row(
        InlineKeyboardButton(text="↩️ Назад в меню", callback_data="nav:menu"),
        InlineKeyboardButton(text="✖️ Отмена", callback_data="nav:cancel"),
    )
    return kb.as_markup()

