import { Card, Grid, Pill } from "../../ui/components";
import { IconCode, IconDevice, IconExternal, IconGitHub, IconLink, IconMessage, IconMic, IconPulse, IconShield, IconStar, IconTelegram, IconTimer, IconWand } from "../../ui/icons";

export function AboutPage() {
  return (
    <Grid>
      <Card title="" fullWidth>
        <div className="about-hero">
          <div className="about-app-icon">
            <IconShield />
          </div>
          <h1 className="about-name">Vantoryx</h1>
          <p className="about-tagline">Защита от мошенников с помощью ИИ</p>
          <Pill tone="neutral">v0.1.0</Pill>
        </div>
        <p className="about-desc">
          Vantoryx анализирует подозрительные сообщения, ссылки и разговоры. Помогает выявить
          мошенничество до того, как вы потеряете деньги или личные данные. Все запросы
          обрабатываются без сохранения ваших данных.
        </p>
      </Card>

      <Card title="Разработчик">
        <div className="about-dev-card">
          <div className="about-dev-avatar">A</div>
          <div>
            <div className="about-dev-name">MrRooty aka Amir</div>
            <div className="about-dev-handle">@Amir22we · Ташкент · 18 лет</div>
          </div>
        </div>
        <p className="about-dev-bio">
          Backend-разработчик на Django и C++. Работаю на Manjaro Linux. Интересуюсь DevOps —
          могу поднять сервер просто ради практики. Активно занимаюсь обучением ИИ-моделей
          и их интеграцией в продукты — Vantoryx один из примеров.
        </p>

        <div className="about-dev-tags">
          <Pill tone="neutral">Django</Pill>
          <Pill tone="neutral">C++</Pill>
          <Pill tone="neutral">Linux</Pill>
          <Pill tone="neutral">DevOps</Pill>
          <Pill tone="neutral">AI/ML</Pill>
        </div>

        <div className="dev-links">
          <a
            href="https://github.com/Amir22we"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link"
          >
            <IconGitHub />
            <span>GitHub</span>
            <IconExternal />
          </a>
          <a
            href="https://t.me/MrRooty"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-link"
          >
            <IconTelegram />
            <span>Telegram</span>
            <IconExternal />
          </a>
        </div>
      </Card>

      <Card title="Ссылки проекта">
        <div className="about-section">
          <div className="about-row">
            <div className="about-row-icon"><IconGitHub /></div>
            <div className="about-row-body">
              <span className="about-row-label">Исходный код</span>
              <a
                href="https://github.com/Amir22we/Vantoryx"
                target="_blank"
                rel="noopener noreferrer"
                className="about-row-link"
              >
                github.com/Amir22we/Vantoryx
                <IconExternal />
              </a>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon"><IconTelegram /></div>
            <div className="about-row-body">
              <span className="about-row-label">Telegram-бот</span>
              <a
                href="https://t.me/VantoryxBot"
                target="_blank"
                rel="noopener noreferrer"
                className="about-row-link"
              >
                @VantoryxBot
                <IconExternal />
              </a>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon"><IconPulse /></div>
            <div className="about-row-body">
              <span className="about-row-label">API</span>
              <a
                href="https://vantoryx.up.railway.app/api/"
                target="_blank"
                rel="noopener noreferrer"
                className="about-row-link"
              >
                REST API
                <IconExternal />
              </a>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon"><IconCode /></div>
            <div className="about-row-body">
              <span className="about-row-label">Схема API</span>
              <a
                href="https://vantoryx.up.railway.app/api/schema/"
                target="_blank"
                rel="noopener noreferrer"
                className="about-row-link"
              >
                OpenAPI / Swagger
                <IconExternal />
              </a>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Технологии">
        <div className="about-section">
          <div className="about-row">
            <div className="about-row-icon">
              <IconCode />
            </div>
            <div className="about-row-body">
              <span className="about-row-label">Backend</span>
              <span className="about-row-value">Django + Django Channels</span>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon">
              <IconStar />
            </div>
            <div className="about-row-body">
              <span className="about-row-label">ИИ</span>
              <span className="about-row-value">GPT-4o-mini + Whisper tiny</span>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon">
              <IconDevice />
            </div>
            <div className="about-row-body">
              <span className="about-row-label">Frontend</span>
              <span className="about-row-value">React 19 + Vite + TypeScript</span>
            </div>
          </div>
          <div className="about-row">
            <div className="about-row-icon">
              <IconShield />
            </div>
            <div className="about-row-body">
              <span className="about-row-label">Деплой</span>
              <span className="about-row-value">Railway</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Режимы">
        <div className="about-modes">
          {[
            {
              icon: <IconShield />,
              label: "Проверка текста",
              desc: "Оценка риска, опасные фразы, краткое резюме",
            },
            {
              icon: <IconLink />,
              label: "Проверка ссылок",
              desc: "Извлечение URL и оценка фишинговых признаков",
            },
            {
              icon: <IconMessage />,
              label: "Что ответить",
              desc: "Безопасный ответ без раскрытия личных данных",
            },
            {
              icon: <IconWand />,
              label: "Переписать честно",
              desc: "Манипулятивный текст — без приукрашиваний",
            },
            {
              icon: <IconTimer />,
              label: "Обратный фишинг",
              desc: "Тянущий время ответ + проверка на утечку данных",
            },
            {
              icon: <IconMic />,
              label: "Аудио",
              desc: "Запись разговора + Whisper + анализ ИИ",
            },
          ].map((m) => (
            <div key={m.label} className="about-mode-item">
              <div className="about-mode-emoji">{m.icon}</div>
              <div>
                <div className="about-mode-name">{m.label}</div>
                <div className="about-mode-desc">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Конфиденциальность" fullWidth>
        <div className="prose">
          <p>
            Приложение не требует регистрации и не сохраняет личные данные. Каждый запрос
            обрабатывается независимо. Не вводите реальные пароли, коды из SMS или номера карт
            в поля ввода.
          </p>
          <p>
            Тексты передаются на сервер для обработки ИИ-моделью и не сохраняются после ответа.
          </p>
        </div>
      </Card>
    </Grid>
  );
}
