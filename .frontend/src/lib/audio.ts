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

export async function startRecording(source: AudioSource) {
  const mimeType = pickMimeType();
  let stream: MediaStream;

  if (source === "mic") {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } else {
    // Device/system audio: best-effort via screen-share audio.
    // Requires user to select a screen/tab and enable "Share audio" (browser UI).
    // Some browsers won't provide system audio — we handle gracefully.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getDisplayMedia = (navigator.mediaDevices as any).getDisplayMedia?.bind(navigator.mediaDevices);
    if (!getDisplayMedia) throw new Error("getDisplayMedia not supported on this device/browser");
    stream = await getDisplayMedia({ video: true, audio: true });
  }

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
        resolve({ blob: out, mimeType: out.type || "application/octet-stream", durationMs });
      };
      rec.stop();
      stream.getTracks().forEach((t) => t.stop());
    });

  return { stop, mimeType: rec.mimeType || mimeType || "audio/webm", stream };
}

