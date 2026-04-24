import { useEffect, useRef, useState } from "react";
import { api, type AudioTask } from "../../lib/api";
import { startRecording, type AudioSource, type Recording } from "../../lib/audio";
import { msToClock } from "../../ui/ui";
import {
  Button, Card, Grid, Pill, ResultSection, ResultText,
  Row, Select, Small,
} from "../../ui/components";
import { IconMic } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));

function AudioResult({ data }: { data: AudioTask }) {
  const statusTone =
    data.status === "done" ? "safe" : data.status === "error" ? "danger" : "warn";
  const statusLabel =
    data.status === "done" ? "Готово" : data.status === "error" ? "Ошибка" : "В обработке";

  return (
    <div className="result-view">
      <div className="result-verdict-row">
        <Pill tone={statusTone}>{statusLabel}</Pill>
      </div>

      {data.transcription && (
        <ResultSection title="Транскрипция разговора">
          <ResultText>{data.transcription}</ResultText>
        </ResultSection>
      )}

      {data.summary && (
        <ResultSection title="Вывод ИИ">
          <ResultText>{data.summary}</ResultText>
        </ResultSection>
      )}

      {data.file && (
        <ResultSection title="Запись">
          <audio controls src={data.file} style={{ width: "100%" }} />
        </ResultSection>
      )}
    </div>
  );
}

export function AudioPage() {
  const [source, setSource] = useState<AudioSource>("mic");
  const [recState, setRecState] = useState<"idle" | "recording" | "stopping">("idle");
  const [recTimeMs, setRecTimeMs] = useState(0);
  const stopRef = useRef<null | (() => Promise<Recording>)>(null);
  const tickRef = useRef<number | null>(null);
  const [res, setRes] = useState<Busy<AudioTask>>({ status: "idle" });

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  async function start() {
    setRes({ status: "idle" });
    setRecTimeMs(0);
    setRecState("recording");
    try {
      const startedAt = performance.now();
      const { stop } = await startRecording(source);
      stopRef.current = stop;
      tickRef.current = window.setInterval(() => setRecTimeMs(Math.round(performance.now() - startedAt)), 250);
    } catch (e) {
      setRecState("idle");
      setRes({ status: "error", error: toErr(e) });
    }
  }

  async function stop() {
    if (!stopRef.current) return;
    setRecState("stopping");
    if (tickRef.current) window.clearInterval(tickRef.current);
    const s = stopRef.current;
    stopRef.current = null;

    try {
      const rec = await s();
      setRecState("idle");
      setRes({ status: "loading" });

      const ext = rec.mimeType.includes("ogg") ? "ogg" : "webm";
      const created = await api.createAudioTask(rec.blob, `recording.${ext}`);
      const taskId = created.id;

      const deadline = performance.now() + 60_000;
      while (true) {
        const task = await api.getAudioTask(taskId);
        if (task.status === "done" || task.status === "error") {
          setRes({ status: "ok", data: task });
          break;
        }
        if (performance.now() > deadline) {
          setRes({ status: "ok", data: task });
          break;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (e) {
      setRecState("idle");
      setRes({ status: "error", error: toErr(e) });
    }
  }

  const info = (
    <>
      <p>Режим записывает разговор через микрофон или системный звук, отправляет аудио на сервер, транскрибирует через Whisper и анализирует ИИ на признаки мошенничества.</p>
      <p>Источник <strong>Микрофон</strong> — запись вашего голоса. Источник <strong>Устройство</strong> — захват звука с экрана/вкладки (работает не во всех браузерах; нужно разрешение на передачу звука в диалоге).</p>
    </>
  );

  return (
    <Grid>
      <Card
        title="Аудио"
        hint="Запишите подозрительный разговор — ИИ расшифрует речь и оценит на признаки мошенничества."
        info={info}
      >
        <Row wrap>
          <Select
            value={source}
            onChange={setSource}
            options={[
              { value: "mic", label: "Микрофон" },
              { value: "device", label: "Устройство / системный звук" },
            ]}
          />

          {recState !== "recording" ? (
            <Button onClick={start} disabled={recState !== "idle"}>
              <IconMic />
              Начать запись
            </Button>
          ) : (
            <Button variant="danger" onClick={stop}>
              <IconMic />
              Остановить {msToClock(recTimeMs)}
            </Button>
          )}

          {recState === "stopping" ? <Pill tone="warn">Обрабатываю…</Pill> : null}
          {res.status === "loading" ? <Pill tone="warn">Отправляю на сервер…</Pill> : null}
          {res.status === "error" ? <Pill tone="danger">{res.error}</Pill> : null}
        </Row>

        <Small>
          Для источника «Устройство» в диалоге браузера нужно включить передачу звука (если опция есть). Работает не во всех браузерах.
        </Small>

        {res.status === "ok" ? <AudioResult data={res.data} /> : null}
      </Card>
    </Grid>
  );
}
