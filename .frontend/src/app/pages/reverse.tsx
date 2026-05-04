import { useMemo, useState } from "react";
import { api, type ReversePhishingResponse } from "../../lib/api";
import {
  Button, Card, Grid, MessageBox, Pill, ResultList,
  ResultSection, Row, TextArea,
} from "../../ui/components";
import { IconTimer } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));


const CHECK_LABEL: Record<string, string> = {
  safe: "Ответ безопасен",
  leaky: "Ответ раскрывает данные",
  uncertain: "Не определено",
};
const CHECK_TONE: Record<string, "safe" | "danger" | "warn"> = {
  safe: "safe",
  leaky: "danger",
  uncertain: "warn",
};

function ReverseResult({ data }: { data: ReversePhishingResponse }) {
  return (
    <div className="result-view">
      {data.reply_message && (
        <MessageBox label="Тянущий время ответ (скопируйте и отправьте)">
          {data.reply_message}
        </MessageBox>
      )}

      {data.self_check_verdict && (
        <ResultSection title="Самопроверка ответа">
          <div className="result-verdict-row">
            <Pill tone={CHECK_TONE[data.self_check_verdict] ?? "warn"}>
              {CHECK_LABEL[data.self_check_verdict] ?? data.self_check_verdict}
            </Pill>
          </div>
          {data.self_check_issues.length > 0 && (
            <ResultList items={data.self_check_issues} variant="negative" />
          )}
        </ResultSection>
      )}
    </div>
  );
}

export function ReversePage() {
  const [input, setInput] = useState("");
  const [res, setRes] = useState<Busy<ReversePhishingResponse>>({ status: "idle" });

  const checkPill = useMemo(() => {
    if (res.status !== "ok") return null;
    const v = res.data.self_check_verdict;
    return <Pill tone={CHECK_TONE[v] ?? "warn"}>{CHECK_LABEL[v] ?? v}</Pill>;
  }, [res]);

  async function run() {
    setRes({ status: "loading" });
    try {
      const data = await api.reversePhishing(input);
      setRes({ status: "ok", data });
    } catch (e) {
      setRes({ status: "error", error: toErr(e) });
    }
  }

  const info = (
    <>
      <p>Режим создаёт «тянущий время» ответ — вежливое сообщение, которое отвлекает мошенника и даёт вам время разобраться в ситуации, позвонить в банк или посоветоваться.</p>
      <p>Дополнительно ИИ проверяет ваш ответ: вердикт <strong>«Раскрывает данные»</strong> означает, что текст может случайно выдать личную информацию.</p>
    </>
  );

  return (
    <Grid>
      <Card
        title="Обратный фишинг"
        hint="Вставьте подозрительное сообщение — ИИ составит безопасный тянущий время ответ и проверит его на утечку данных."
        info={info}
      >
        <TextArea value={input} onChange={setInput} placeholder="Вставьте подозрительное сообщение…" />

        <Row wrap>
          <Button onClick={run} disabled={!input.trim() || res.status === "loading"}>
            <IconTimer />
            Сгенерировать
          </Button>
          {res.status === "loading" ? <Pill tone="warn">Генерирую…</Pill> : null}
          {res.status === "ok" ? checkPill : null}
          {res.status === "error" ? <Pill tone="danger">{res.error}</Pill> : null}
        </Row>

        {res.status === "ok" ? <ReverseResult data={res.data} /> : null}
      </Card>
    </Grid>
  );
}
