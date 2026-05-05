import { useState } from "react";
import { api } from "../../lib/api";
import { usePageMeta } from "../../lib/meta";
import { Button, Card, Grid, Pill, Row } from "../../ui/components";
import { IconPulse } from "../../ui/icons";

type Busy<T> = { status: "idle" } | { status: "loading" } | { status: "ok"; data: T } | { status: "error"; error: string };
const toErr = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function StatusPage() {
  usePageMeta({ title: "Статус сервиса | Vantoryx", noindex: true });
  const [ping, setPing] = useState<Busy<{ message: string }>>({ status: "idle" });

  async function run() {
    setPing({ status: "loading" });
    try {
      const data = await api.ping();
      setPing({ status: "ok", data });
    } catch (e) {
      setPing({ status: "error", error: toErr(e) });
    }
  }

  return (
    <Grid>
      <Card
        title="Статус сервиса"
        hint="Убедимся, что сервер на связи — иначе остальные инструменты не сработают."
        info={<p>Один ping-запрос на сервер. Если ответа нет — анализ работать не будет. Проверьте статус перед использованием или при ошибках.</p>}
      >
        <Row wrap>
          <Button onClick={run} disabled={ping.status === "loading"}>
            <IconPulse />
            Проверить соединение
          </Button>
          {ping.status === "loading" ? <Pill tone="warn">Проверяем…</Pill> : null}
          {ping.status === "error" ? <Pill tone="danger">Нет связи</Pill> : null}
        </Row>

        {ping.status === "ok" ? (
          <div className="result-view">
            <div className="status-ok">
              <div className="status-ok__icon">✓</div>
              <div className="status-ok__body">
                <div className="status-ok__title">Сервер на связи</div>
                {ping.data.message && (
                  <div className="status-ok__msg">{ping.data.message}</div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {ping.status === "error" ? (
          <div className="result-view">
            <div className="status-error">
              <div className="status-error__icon">✗</div>
              <div className="status-error__body">
                <div className="status-error__title">Нет соединения</div>
                <div className="status-error__msg">{ping.error}</div>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </Grid>
  );
}
