# Vantoryx (frontend)

Веб-приложение (телефон/планшет/десктоп/TV) которое обращается к серверу:

- `GET /api/ping/`
- `POST /api/text/` — анализ текста на скам
- `POST /api/link/` — анализ ссылок
- `POST /api/reply/` — «что ответить?»
- `POST /api/rewrite/` — «перепиши честно»
- `POST /api/reverse/` — «обратный фишинг»
- `POST /api/audio-tasks/` + `GET /api/audio-tasks/{id}/` — загрузка аудио и получение результата

## Запуск

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`VITE_SERVICE_BASE_URL`:
- если указать (например `http://127.0.0.1:8000`) — запросы пойдут туда
- если оставить пустым — будет **same-origin** (удобно за nginx/proxy)

## Запись аудио

- **Микрофон**: `getUserMedia({audio:true})`
- **Системный звук/устройство (best-effort)**: `getDisplayMedia({audio:true, video:true})`
  - обычно работает в Chrome/Edge (нужно включить «Share audio» в диалоге шаринга)
  - на iOS/Safari/некоторых Android может не поддерживаться
