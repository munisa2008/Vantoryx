export type AudioSource = "mic" | "device";

export type Recording = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
};

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const mt of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(mt)) return mt;
  }
  return "";
}

async function getAudioStream(source: AudioSource): Promise<MediaStream> {
  if (source === "mic") {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDisplayMedia = (navigator.mediaDevices as any).getDisplayMedia?.bind(navigator.mediaDevices);
  if (!getDisplayMedia) throw new Error("getDisplayMedia не поддерживается в этом браузере");

  const display: MediaStream = await getDisplayMedia({ video: true, audio: true });

  // Stop video — we only need audio tracks
  display.getVideoTracks().forEach((t) => t.stop());

  const audioTracks = display.getAudioTracks();
  if (audioTracks.length === 0) {
    throw new Error(
      "Браузер не передал звук с устройства. В диалоге выбора экрана включите «Поделиться звуком».",
    );
  }

  return new MediaStream(audioTracks);
}

/** Legacy: record full clip and return blob. */
export async function startRecording(source: AudioSource) {
  const mimeType = pickMimeType();
  const stream = await getAudioStream(source);
  const chunks: BlobPart[] = [];
  const startedAt = performance.now();
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  rec.start(500);

  const stop = () =>
    new Promise<Recording>((resolve, reject) => {
      rec.onerror = () => reject(new Error("MediaRecorder error"));
      rec.onstop = () => {
        const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
        const out = new Blob(chunks, { type: rec.mimeType || mimeType || "application/octet-stream" });
        stream.getTracks().forEach((t) => t.stop());
        resolve({ blob: out, mimeType: out.type || "application/octet-stream", durationMs });
      };
      rec.stop();
    });

  return { stop, mimeType: rec.mimeType || mimeType || "audio/webm", stream };
}

/** Streaming: fires onChunk with each ArrayBuffer timeslice (for WebSocket). */
export async function startStreamingRecorder(
  source: AudioSource,
  onChunk: (data: ArrayBuffer) => void,
) {
  const mimeType = pickMimeType();
  const stream = await getAudioStream(source);
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

  rec.ondataavailable = async (e) => {
    if (e.data && e.data.size > 0) {
      const buf = await e.data.arrayBuffer();
      onChunk(buf);
    }
  };

  rec.start(1000); // 1-second timeslices

  const stop = (): Promise<void> =>
    new Promise((resolve, reject) => {
      rec.onerror = () => reject(new Error("MediaRecorder error"));
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve();
      };
      rec.stop();
    });

  return { stop, mimeType: rec.mimeType || mimeType || "audio/webm" };
}
