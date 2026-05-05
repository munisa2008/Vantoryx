import json
import asyncio
import tempfile
import os
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from openai import OpenAI
from django.conf import settings
from asgiref.sync import sync_to_async

from .transcribe import transcribe_with_whisper_local

_CHUNK_BYTES = 32_000
_TMP_DIR = "/dev/shm" if os.path.isdir("/dev/shm") else tempfile.gettempdir()


class TranscribeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.all_chunks = []     
        self.full_transcript = ""
        self.pending_size = 0
        self.processing = False
        qs = parse_qs(self.scope.get("query_string", b"").decode())
        self.device_id = qs.get("device_id", [""])[0]

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            self.all_chunks.append(bytes_data)
            self.pending_size += len(bytes_data)

            if self.pending_size >= _CHUNK_BYTES and not self.processing:
                self.processing = True
                asyncio.create_task(self.flush_and_transcribe())

        elif text_data:
            data = json.loads(text_data)
            if data.get("type") == "stop":
                while self.processing:
                    await asyncio.sleep(0.05)
                if self.all_chunks:
                    self.processing = True
                    await self.flush_and_transcribe()
                await self.classify()

    async def flush_and_transcribe(self):
        chunk_data = b"".join(self.all_chunks)
        self.pending_size = 0  

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False, dir=_TMP_DIR) as f:
            f.write(chunk_data)
            tmp_path = f.name

        try:
            loop = asyncio.get_running_loop()
            text = await loop.run_in_executor(
                None,
                transcribe_with_whisper_local,
                tmp_path, "ru", "tiny",
            )
            if text:
                self.full_transcript = text.strip()
                await self.send(json.dumps({
                    "type": "partial",
                    "text": self.full_transcript,
                    "full": self.full_transcript,
                }))
        except Exception:
            pass
        finally:
            self.processing = False
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    async def classify(self):
        transcript = self.full_transcript.strip()
        if not transcript:
            await self.send(json.dumps({
                "type": "result",
                "verdict": "Нет речи",
                "transcript": "",
            }))
            return

        await self.send(json.dumps({"type": "classifying"}))

        try:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=settings.OPENROUTER_API_KEY,
            )
            loop = asyncio.get_running_loop()
            completion = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="openai/gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "Ты — система классификации телефонных разговоров и сообщений."
                                "Твоя задача — определить, является ли звонок мошенническим."
                                "Проанализируй текст разговора и определи: есть ли признаки мошенничества, попытка обмана, давления, срочности, запросы денег, кодов, паролей, SMS, карт, CVV, представление сотрудником банка, полиции, госорганов без подтверждений, манипуляции страхом, выгодой или угрозами, несоответствия, социальная инженерия"
                                "❗Правила ответа: 1. Отвечай ТОЛЬКО одной из двух фраз. 2. Никаких пояснений, комментариев, знаков препинания или дополнительного текста. 3. Формулировки должны совпадать ТОЧНО."
                                "Допустимые ответы: 'Звонят мошенники!', 'Звонок безопасный'"
                                "Если есть ХОТЬ МАЛЕЙШИЕ признаки мошенничества — выбирай:'Звонят мошенники!'"
                                "Если звонок выглядит обычным, бытовым или нейтральным — выбирай:'Звонок безопасный'"
                            ),
                        },
                        {"role": "user", "content": transcript},
                    ],
                    temperature=0.0,
                    max_tokens=50,
                ),
            )
            verdict = (completion.choices[0].message.content or "").strip()
        except Exception as e:
            verdict = f"Ошибка классификации: {repr(e)}"

        try:
            from .models import HistoryEntry
            await sync_to_async(HistoryEntry.objects.create)(
                entry_type="audio",
                device_id=self.device_id,
                result={
                    "transcription": transcript,
                    "summary": verdict,
                    "status": "done",
                },
            )
        except Exception:
            pass

        await self.send(json.dumps({
            "type": "result",
            "verdict": verdict,
            "transcript": transcript,
        }))
