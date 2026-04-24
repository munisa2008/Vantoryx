import { useEffect, useState, type ReactElement } from "react";
import { api, type HistoryEntry, type HistoryEntryType } from "../../lib/api";
import { Button, Card, Grid, Pill, Row } from "../../ui/components";
import {
  IconHistory,
  IconLink,
  IconMessage,
  IconMic,
  IconShield,
  IconTimer,
  IconWand,
} from "../../ui/icons";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: HistoryEntry[] }
  | { status: "error"; error: string };

const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));

const TYPE_META: Record<
  HistoryEntryType,
  { label: string; icon: ReactElement; tone: "neutral" | "safe" | "warn" | "danger" }
> = {
  text: { label: "Текст", icon: <IconShield />, tone: "neutral" },
  link: { label: "Ссылки", icon: <IconLink />, tone: "neutral" },
  audio: { label: "Аудио", icon: <IconMic />, tone: "neutral" },
  reply: { label: "Что ответить", icon: <IconMessage />, tone: "neutral" },
  rewrite: { label: "Переписать", icon: <IconWand />, tone: "neutral" },
  reverse: { label: "Обратный фишинг", icon: <IconTimer />, tone: "neutral" },
};

function verdictTone(v: string): "safe" | "warn" | "danger" | "neutral" {
  if (v === "safe" || v === "neutral") return "safe";
  if (v === "scam" || v === "danger") return "danger";
  if (v === "leaky") return "danger";
  return "warn";
}

function ResultSummary({ entry }: { entry: HistoryEntry }) {
  const r = entry.result as Record<string, unknown>;

  if (entry.entry_type === "text") {
    const verdict = String(r.verdict ?? "");
    const score = r.risk_score != null ? Number(r.risk_score) : null;
    const explanation = String(r.short_explanation ?? "");
    return (
      <div className="history-entry__summary">
        <Row wrap>
          {verdict && <Pill tone={verdictTone(verdict)}>{verdict}</Pill>}
          {score != null && <Pill tone="neutral">риск {score}/100</Pill>}
        </Row>
        {explanation && <p className="history-entry__text">{explanation}</p>}
      </div>
    );
  }

  if (entry.entry_type === "link") {
    const verdict = String(r.verdict ?? "");
    const score = r.risk_score != null ? Number(r.risk_score) : null;
    const urls = Array.isArray(r.extracted_urls) ? (r.extracted_urls as string[]) : [];
    const ai = String(r.ai_conclusion ?? "");
    return (
      <div className="history-entry__summary">
        <Row wrap>
          {verdict && <Pill tone={verdictTone(verdict)}>{verdict}</Pill>}
          {score != null && <Pill tone="neutral">риск {score}/100</Pill>}
          {urls.length > 0 && <Pill tone="neutral">{urls.length} URL</Pill>}
        </Row>
        {ai && <p className="history-entry__text">{ai}</p>}
      </div>
    );
  }

  if (entry.entry_type === "audio") {
    const status = String(r.status ?? "");
    const summary = String(r.summary ?? "");
    const transcription = String(r.transcription ?? "");
    return (
      <div className="history-entry__summary">
        <Row wrap>
          {status && (
            <Pill tone={status === "done" ? "safe" : status === "error" ? "danger" : "warn"}>
              {status}
            </Pill>
          )}
          {summary && <Pill tone={summary.includes("мошенник") ? "danger" : "safe"}>{summary}</Pill>}
        </Row>
        {transcription && (
          <p className="history-entry__text history-entry__text--clamp">{transcription}</p>
        )}
        {entry.audio_file && (
          <audio controls src={entry.audio_file} className="history-entry__audio" />
        )}
      </div>
    );
  }

  if (entry.entry_type === "reply") {
    const msg = String(r.reply_message ?? "");
    return (
      <div className="history-entry__summary">
        {msg && <p className="history-entry__text">{msg}</p>}
      </div>
    );
  }

  if (entry.entry_type === "rewrite") {
    const honest = String(r.honest_version ?? "");
    const flags = Array.isArray(r.red_flags) ? (r.red_flags as string[]) : [];
    return (
      <div className="history-entry__summary">
        {honest && <p className="history-entry__text">{honest}</p>}
        {flags.length > 0 && (
          <Row wrap>
            {flags.map((f, i) => (
              <Pill key={i} tone="warn">{f}</Pill>
            ))}
          </Row>
        )}
      </div>
    );
  }

  if (entry.entry_type === "reverse") {
    const msg = String(r.reply_message ?? "");
    const verdict = String(r.self_check_verdict ?? "");
    return (
      <div className="history-entry__summary">
        <Row wrap>
          {verdict && <Pill tone={verdictTone(verdict)}>{verdict}</Pill>}
        </Row>
        {msg && <p className="history-entry__text">{msg}</p>}
      </div>
    );
  }

  return null;
}

function EntryCard({ entry }: { entry: HistoryEntry }) {
  const meta = TYPE_META[entry.entry_type] ?? TYPE_META.text;
  const date = new Date(entry.created_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="history-entry">
      <div className="history-entry__header">
        <div className="history-entry__type">
          {meta.icon}
          <span className="history-entry__type-label">{meta.label}</span>
        </div>
        <span className="history-entry__date">{date}</span>
      </div>

      {entry.input_text && (
        <p className="history-entry__input history-entry__text--clamp">{entry.input_text}</p>
      )}

      <ResultSummary entry={entry} />
    </div>
  );
}

const TYPE_FILTER_OPTIONS: Array<{ value: HistoryEntryType | "all"; label: string }> = [
  { value: "all", label: "Все" },
  { value: "text", label: "Текст" },
  { value: "link", label: "Ссылки" },
  { value: "audio", label: "Аудио" },
  { value: "reply", label: "Что ответить" },
  { value: "rewrite", label: "Переписать" },
  { value: "reverse", label: "Обратный фишинг" },
];

export function HistoryPage() {
  const [state, setState] = useState<LoadState>({ status: "idle" });
  const [filter, setFilter] = useState<HistoryEntryType | "all">("all");

  async function load() {
    setState({ status: "loading" });
    try {
      const raw = await api.historyList();
      if (!Array.isArray(raw)) {
        setState({ status: "error", error: "Сервер вернул неожиданный ответ. Проверьте, что Django запущен и VITE_SERVICE_BASE_URL настроен." });
        return;
      }
      setState({ status: "ok", data: raw });
    } catch (e) {
      setState({ status: "error", error: toErr(e) });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const entries =
    state.status === "ok"
      ? filter === "all"
        ? state.data
        : state.data.filter((e) => e.entry_type === filter)
      : [];

  return (
    <Grid>
      <Card
        title="История"
        hint="Последние 100 проверок из всех режимов"
        fullWidth
      >
        <div className="history-toolbar">
          <Row wrap>
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip${filter === opt.value ? " chip--active" : ""}`}
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </Row>
          <Button onClick={load} disabled={state.status === "loading"}>
            <IconHistory />
            {state.status === "loading" ? "Загрузка…" : "Обновить"}
          </Button>
        </div>

        {state.status === "error" && (
          <Pill tone="danger">{state.error}</Pill>
        )}

        {state.status === "ok" && entries.length === 0 && (
          <p className="history-empty">Записей нет</p>
        )}

        <div className="history-list">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </Card>
    </Grid>
  );
}
