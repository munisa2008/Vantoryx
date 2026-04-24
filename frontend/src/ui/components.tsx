import { useEffect, useState, type ReactNode } from "react";
import { cx } from "./ui";
import { IconInfo, IconShieldLarge } from "./icons";

export function AppShell(props: { children: ReactNode }) {
  return <div className="app">{props.children}</div>;
}

export function TopBar(props: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="brand">
          <span className="brand__dot" />
          <span className="brand__name">{props.title}</span>
        </div>
        {props.subtitle ? <div className="topbar__sub">{props.subtitle}</div> : null}
      </div>
      <div className="topbar__right">{props.right}</div>
    </header>
  );
}

export function Grid(props: { children: ReactNode }) {
  return <div className="grid">{props.children}</div>;
}

export function Card(props: {
  title: string;
  hint?: string;
  children: ReactNode;
  tone?: "neutral" | "danger" | "safe";
  info?: ReactNode;
  fullWidth?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <section className={cx("card", props.tone && `card--${props.tone}`, props.fullWidth && "card--full")}>
      <div className="card__head">
        <div className="card__head-row">
          {props.title ? <h2 className="card__title">{props.title}</h2> : null}
          {props.info ? (
            <button
              className={cx("card__info-btn", infoOpen && "card__info-btn--active")}
              onClick={() => setInfoOpen((v) => !v)}
              aria-label="О режиме"
              type="button"
            >
              <IconInfo />
            </button>
          ) : null}
        </div>
        {props.hint ? <p className="card__hint">{props.hint}</p> : null}
        {props.info && infoOpen ? <div className="card__info-panel">{props.info}</div> : null}
      </div>
      <div className="card__body">{props.children}</div>
    </section>
  );
}

export function Button(props: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
}) {
  const variant = props.variant || "primary";
  return (
    <button
      className={cx("btn", `btn--${variant}`)}
      onClick={props.onClick}
      disabled={props.disabled}
      type={props.type || "button"}
    >
      {props.children}
    </button>
  );
}

export function TextArea(props: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea
      className="textarea"
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function Select<T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <select className="select" value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
      {props.options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Pill(props: { tone?: "neutral" | "safe" | "warn" | "danger"; children: ReactNode }) {
  return <span className={cx("pill", props.tone ? `pill--${props.tone}` : "pill--neutral")}>{props.children}</span>;
}

export function CodeBox(props: { children: ReactNode }) {
  return <pre className="code">{props.children}</pre>;
}

export function Row(props: { children: ReactNode; wrap?: boolean }) {
  return <div className={cx("row", props.wrap && "row--wrap")}>{props.children}</div>;
}

export function Small(props: { children: ReactNode }) {
  return <div className="small">{props.children}</div>;
}

export function Kbd(props: { children: ReactNode }) {
  return <kbd className="kbd">{props.children}</kbd>;
}

/* ── Splash Screen ────────────────────────────────────── */
export function SplashScreen(props: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1400);
    const doneTimer = setTimeout(() => props.onDone(), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [props.onDone]);

  return (
    <div className={`splash${fading ? " splash--fade" : ""}`} aria-hidden="true">
      <div className="splash__content">
        <div className="splash__icon">
          <IconShieldLarge />
        </div>
        <div className="splash__name">Vantoryx</div>
        <div className="splash__tagline">Защита от мошенников</div>
      </div>
    </div>
  );
}

/* ── Result View Components ───────────────────────────── */

export function ResultSection(props: { title: string; children: ReactNode }) {
  return (
    <div className="result-section">
      <div className="result-section__title">{props.title}</div>
      <div className="result-section__body">{props.children}</div>
    </div>
  );
}

export function ResultText(props: { children: ReactNode }) {
  return <div className="result-text">{props.children}</div>;
}

export function ResultList(props: { items: string[]; variant?: "positive" | "negative" | "neutral" }) {
  const variant = props.variant ?? "neutral";
  return (
    <ul className={`result-list result-list--${variant}`}>
      {props.items.map((item, i) => (
        <li key={i} className="result-list__item">{item}</li>
      ))}
    </ul>
  );
}

export function RiskBar(props: { score: number }) {
  const tone = props.score >= 70 ? "danger" : props.score >= 40 ? "warn" : "safe";
  return (
    <div className="risk-bar">
      <div className="risk-bar__header">
        <span className="risk-bar__label">Уровень риска</span>
        <span className={`risk-bar__value risk-bar__value--${tone}`}>{props.score}/100</span>
      </div>
      <div className="risk-bar__track">
        <div
          className={`risk-bar__fill risk-bar__fill--${tone}`}
          style={{ width: `${props.score}%` }}
        />
      </div>
    </div>
  );
}

export function MessageBox(props: { label: string; children: ReactNode }) {
  return (
    <div className="message-box">
      <div className="message-box__label">{props.label}</div>
      <div className="message-box__text">{props.children}</div>
    </div>
  );
}
