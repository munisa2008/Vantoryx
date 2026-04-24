from __future__ import annotations

from dataclasses import dataclass
from typing import Any
import asyncio

import aiohttp


@dataclass(frozen=True)
class ApiClient:
    base_url: str
    timeout_s: float = 15.0

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    async def ping(self) -> dict[str, Any]:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout_s)) as session:
            async with session.get(self._url("/api/ping/")) as resp:
                return await resp.json()

    async def text_scam(self, text: str) -> dict[str, Any]:
        return await self._post_json("/api/text/", {"text": text})

    async def link_analysis(self, text: str) -> dict[str, Any]:
        return await self._post_json("/api/link/", {"text": text})

    async def what_to_reply(self, text: str) -> dict[str, Any]:
        return await self._post_json("/api/reply/", {"text": text})

    async def human_rewrite(self, text: str) -> dict[str, Any]:
        return await self._post_json("/api/rewrite/", {"text": text})

    async def reverse_phishing(self, text: str) -> dict[str, Any]:
        return await self._post_json("/api/reverse/", {"text": text})

    async def create_audio_task(self, filename: str, content_type: str, data: bytes) -> dict[str, Any]:
        form = aiohttp.FormData()
        form.add_field("file", data, filename=filename, content_type=content_type or "application/octet-stream")

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout_s)) as session:
            async with session.post(self._url("/api/audio-tasks/"), data=form) as resp:
                return await resp.json()

    async def get_audio_task(self, task_id: int) -> dict[str, Any]:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout_s)) as session:
            async with session.get(self._url(f"/api/audio-tasks/{task_id}/")) as resp:
                return await resp.json()

    async def wait_audio_result(
        self,
        task_id: int,
        *,
        poll_seconds: int = 60,
        interval_s: float = 3.0,
    ) -> dict[str, Any]:
        deadline = asyncio.get_event_loop().time() + float(poll_seconds)
        last = {}
        while True:
            last = await self.get_audio_task(task_id)
            if last.get("status") in {"done", "error"}:
                return last
            if asyncio.get_event_loop().time() >= deadline:
                return last
            await asyncio.sleep(interval_s)

    async def _post_json(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.timeout_s)) as session:
            async with session.post(self._url(path), json=payload) as resp:
                return await resp.json()

