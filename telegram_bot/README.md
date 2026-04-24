# Telegram bot (aiogram) for Vantoryx API

Бот дергает **каждый API-ендпоинт** бекенда и даёт удобный UX в Telegram: меню-кнопки, пошаговые режимы, «Назад/Отмена», красивый форматированный вывод.

## Возможности

- `GET /api/ping/` — проверка доступности
- `POST /api/text/` — анализ текста на скам
- `POST /api/link/` — анализ ссылок
- `POST /api/reply/` — «что ответить?» (безопасный отказ + checklist)
- `POST /api/rewrite/` — «перепиши как нормальный человек» (честная версия)
- `POST /api/reverse/` — «обратный фишинг» (тянущий время ответ + самопроверка)
- `POST /api/audio-tasks/` + `GET /api/audio-tasks/{id}/` — загрузка аудио и получение результата

## Быстрый старт

Создайте виртуальное окружение и установите зависимости:

```bash
cd telegram_bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Создайте `.env`:

```bash
cp .env.example .env
```

Запустите:

```bash
python bot.py
```

## Переменные окружения

- `BOT_TOKEN` — токен Telegram бота
- `API_BASE_URL` — базовый URL бекенда, например `http://127.0.0.1:8000` или `https://<your-domain>`
- `REQUEST_TIMEOUT_S` — таймаут HTTP запросов (по умолчанию 15)
- `AUDIO_POLL_SECONDS` — сколько секунд ждать результат аудио (по умолчанию 60)
- `AUDIO_POLL_INTERVAL_S` — интервал опроса (по умолчанию 3)

## Примечания

- Бекенд сейчас без auth и CSRF, поэтому бот может обращаться к API напрямую.
- Для аудио бот принимает `voice`, `audio`, `document` (подходит webm/ogg/mp3/wav и т.п.).

