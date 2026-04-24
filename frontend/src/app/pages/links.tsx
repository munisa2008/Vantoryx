import { useMemo, useState } from "react";
import { api, type LinkAnalysisResponse } from "../../lib/api";
import {
  Button, Card, Grid, Pill, ResultList, ResultSection,
  ResultText, RiskBar, Row, TextArea,
} from "../../ui/components";
import { IconLink } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));


const VERDICT_LABEL: Record<string, string> = {
  danger: "Опасно",
  neutral: "Безопасно",
  unknown: "Не определено",
  suspicious: "Подозрительно",
};
const VERDICT_TONE: Record<string, "danger" | "safe" | "warn"> = {
  danger: "danger",
  neutral: "safe",
  unknown: "warn",
  suspicious: "warn",
};

function LinksResult({ data }: { data: LinkAnalysisResponse }) {
  return (
    <div className="result-view">
      <div className="result-verdict-row">
        <Pill tone={VERDICT_TONE[data.verdict] ?? "warn"}>
          {VERDICT_LABEL[data.verdict] ?? data.verdict}
        </Pill>
        {data.extracted_urls.length > 0 && (
          <Pill tone="neutral">Найдено URL: {data.extracted_urls.length}</Pill>
        )}
      </div>

      <RiskBar score={data.risk_score} />

      {data.ai_conclusion && (
        <ResultSection title="Заключение ИИ">
          <ResultText>{data.ai_conclusion}</ResultText>
        </ResultSection>
      )}

      {data.items.length > 0 && (
        <ResultSection title="Детали по ссылкам">
          <div className="url-list">
            {data.items.map((item, i) => (
              <div key={i} className="url-item">
                <div className="url-item__header">
                  <span className="url-item__domain">{item.domain}</span>
                  <Pill tone={VERDICT_TONE[item.verdict] ?? "warn"}>
                    {VERDICT_LABEL[item.verdict] ?? item.verdict}
                  </Pill>
                </div>
                <div className="url-item__url">{item.url}</div>
                {item.reasons.length > 0 && (
                  <ResultList items={item.reasons} variant="negative" />
                )}
              </div>
            ))}
          </div>
        </ResultSection>
      )}
    </div>
  );
}

export function LinksPage() {
  const [input, setInput] = useState("");
  const [res, setRes] = useState<Busy<LinkAnalysisResponse>>({ status: "idle" });

  const verdictPill = useMemo(() => {
    if (res.status !== "ok") return null;
    const v = res.data.verdict;
    return <Pill tone={VERDICT_TONE[v] ?? "warn"}>{VERDICT_LABEL[v] ?? v}</Pill>;
  }, [res]);

  async function run() {
    setRes({ status: "loading" });
    try {
      const data = await api.linkAnalysis(input);
      setRes({ status: "ok", data });
    } catch (e) {
      setRes({ status: "error", error: toErr(e) });
    }
  }

  const info = (
    <>
      <p>Режим извлекает все URL из текста и оценивает каждую ссылку по признакам фишинга: укороченные домены, подозрительные параметры, имитация известных сервисов.</p>
      <p>Итоговый вердикт: <strong>Безопасно</strong>, <strong>Подозрительно</strong> или <strong>Опасно</strong>. Вставьте любой текст со ссылками — режим извлечёт их автоматически.</p>
    </>
  );

  return (
    <Grid>
      <Card
        title="Проверка ссылок"
        hint="Вставьте текст с подозрительными ссылками — ИИ извлечёт адреса и оценит каждый на признаки фишинга."
        info={info}
      >
        <TextArea value={input} onChange={setInput} placeholder="Вставьте текст со ссылками…" />

        <Row wrap>
          <Button onClick={run} disabled={!input.trim() || res.status === "loading"}>
            <IconLink />
            Проверить
          </Button>
          {res.status === "loading" ? <Pill tone="warn">Анализирую…</Pill> : null}
          {res.status === "ok" ? verdictPill : null}
          {res.status === "error" ? <Pill tone="danger">{res.error}</Pill> : null}
        </Row>

        {res.status === "ok" ? <LinksResult data={res.data} /> : null}
      </Card>
    </Grid>
  );
}
