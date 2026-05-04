FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY telegram_bot/requirements.txt ./bot_requirements.txt
RUN pip install --no-cache-dir -r bot_requirements.txt

COPY . .

RUN python -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu', compute_type='int8')"

COPY supervisord.conf /etc/supervisor/conf.d/vantoryx.conf

EXPOSE 8000

ENTRYPOINT ["bash", "entrypoint.sh"]
