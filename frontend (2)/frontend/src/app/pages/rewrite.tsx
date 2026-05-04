import { useState } from "react";
import { api, type HumanRewriteResponse } from "../../lib/api";
import {
  Button, Card, Grid, MessageBox, Pill, ResultSection,
  Row, TextArea,
} from "../../ui/components";
import { IconWand } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));


function RewriteResult({ data }: { data: HumanRewriteResponse }) {
  return (
    <div className="result-view">
      {data.honest_version && (
        <MessageBox label="Честная версия (что на самом деле написано)">
          {data.honest_version}
        </MessageBox>
      )}

      {data.red_flags.length > 0 && (
        <ResultSection title="Красные флаги">
          <div className="flag-list">
            {data.red_flags.map((flag, i) => (
              <span key={i} className="flag-item">{flag}</span>
            ))}
          </div>
        </ResultSection>
      )}
    </div>
  );
}

export function RewritePage() {
  const [input, setInput] = useState("");
  const [res, setRes] = useState<Busy<HumanRewriteResponse>>({ status: "idle" });

  async function run() {
    setRes({ status: "loading" });
    try {
      const data = await api.humanRewrite(input);
      setRes({ status: "ok", data });
    } catch (e) {
      setRes({ status: "error", error: toErr(e) });
    }
  }

  const info = (
    <>
      <p>Режим убирает эмоциональное давление, срочность и манипуляции из текста и переписывает его «честным» языком — прямо называя истинное намерение отправителя.</p>
      <p>Полезно, чтобы увидеть реальный смысл сообщения без давления и понять, чего на самом деле хочет собеседник.</p>
    </>
  );

  return (
    <Grid>
      <Card
        title="Переписать честно"
        hint="Вставьте подозрительное сообщение — ИИ уберёт манипуляции и покажет его истинный смысл."
        info={info}
      >
        <TextArea value={input} onChange={setInput} placeholder="Вставьте подозрительный текст…" />

        <Row wrap>
          <Button onClick={run} disabled={!input.trim() || res.status === "loading"}>
            <IconWand />
            Переписать
          </Button>
          {res.status === "loading" ? <Pill tone="warn">Анализирую…</Pill> : null}
          {res.status === "ok" ? <Pill tone="safe">Готово</Pill> : null}
          {res.status === "error" ? <Pill tone="danger">{res.error}</Pill> : null}
        </Row>

        {res.status === "ok" ? <RewriteResult data={res.data} /> : null}
      </Card>
    </Grid>
  );
}
