import { useMemo, useState } from "react";
import { api, type TextScamResponse } from "../../lib/api";
import {
  Button, Card, Grid, Pill, ResultList,
  ResultSection, ResultText, RiskBar, Row, TextArea,
} from "../../ui/components";
import { IconShield } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));


const VERDICT_LABEL: Record<string, string> = {
  scam: "Мошенничество",
  safe: "Безопасно",
  uncertain: "Подозрительно",
};
const VERDICT_TONE: Record<string, "danger" | "safe" | "warn"> = {
  scam: "danger",
  safe: "safe",
  uncertain: "warn",
};

function TextResult({ data }: { data: TextScamResponse }) {
  return (
    <div className="result-view">
      <div className="result-verdict-row">
        <Pill tone={VERDICT_TONE[data.verdict] ?? "warn"}>
          {VERDICT_LABEL[data.verdict] ?? data.verdict}
        </Pill>
      </div>

      <RiskBar score={data.risk_score} />

      {data.short_explanation && (
        <ResultSection title="Заключение">
          <ResultText>{data.short_explanation}</ResultText>
        </ResultSection>
      )}

      {data.reasons.length > 0 && (
        <ResultSection title="Признаки опасности">
          <ResultList items={data.reasons} variant="negative" />
        </ResultSection>
      )}
    </div>
  );
}

export function TextPage() {
  const [input, setInput] = useState("");
  const [res, setRes] = useState<Busy<TextScamResponse>>({ status: "idle" });

  const verdictPill = useMemo(() => {
    if (res.status !== "ok") return null;
    const v = res.data.verdict;
    return <Pill tone={VERDICT_TONE[v] ?? "warn"}>{VERDICT_LABEL[v] ?? v}</Pill>;
  }, [res]);

  async function run() {
    setRes({ status: "loading" });
    try {
      const data = await api.textScam(input);
      setRes({ status: "ok", data });
    } catch (e) {
      setRes({ status: "error", error: toErr(e) });
    }
  }

  const info = (
    <>
      <p>Режим анализирует текст сообщения и оценивает риск по трём уровням: <strong>Безопасно</strong>, <strong>Подозрительно</strong>, <strong>Мошенничество</strong>.</p>
      <p>ИИ выделяет опасные фразы, объясняет причины и даёт краткое резюме. Подходит для проверки SMS, переписки в мессенджерах и писем.</p>
      <p>Совет: вставляйте сообщение целиком, включая контекст — это повышает точность оценки.</p>
    </>
  );

  return (
    <Grid>
      <Card
        title="Проверка текста"
        hint="Вставьте подозрительное сообщение — ИИ оценит риск, объяснит причины и даст заключение."
        info={info}
      >
        <TextArea value={input} onChange={setInput} placeholder="Вставьте текст…" />

        <Row wrap>
          <Button onClick={run} disabled={!input.trim() || res.status === "loading"}>
            <IconShield />
            Проверить
          </Button>
          {res.status === "loading" ? <Pill tone="warn">Анализирую…</Pill> : null}
          {res.status === "ok" ? verdictPill : null}
          {res.status === "error" ? <Pill tone="danger">{res.error}</Pill> : null}
        </Row>

        {res.status === "ok" ? <TextResult data={res.data} /> : null}
      </Card>
    </Grid>
  );
}
