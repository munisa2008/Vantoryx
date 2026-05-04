import { useTheme } from "../../lib/theme";
import { Card, Grid } from "../../ui/components";
import {
  IconCheck,
  IconDevice,
  IconInfo,
  IconLinux,
  IconMoon,
  IconPerson,
  IconShield,
  IconStar,
  IconSun,
} from "../../ui/icons";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <Grid>
      {/* <Card
        title="Внешний вид"
        hint="Настройте отображение приложения под себя"
        fullWidth
      >
        <div className="settings-group">
          <div className="settings-row">
            <div className="settings-row__info">
              <div className="settings-row__label">Тема оформления</div>
              <div className="settings-row__desc">
                Выберите светлую или тёмную тему
              </div>
            </div>
            <div className="theme-switcher">
              <button
                type="button"
                className={`theme-option${theme === "light" ? " theme-option--active" : ""}`}
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
              >
                <IconSun />
                <span>Светлая</span>
              </button>
              <button
                type="button"
                className={`theme-option${theme === "dark" ? " theme-option--active" : ""}`}
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <IconMoon />
                <span>Тёмная</span>
              </button>
            </div>
          </div>
        </div>
      </Card> */}

      <Card title="Конфиденциальность и данные" fullWidth>
        <div className="settings-group">
          <div className="settings-info-block">
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconCheck />
              </span>
              <div>
                <div className="settings-row__label">Анонимность</div>
                <div className="settings-row__desc">
                  Приложение не требует регистрации и не сохраняет личные данные
                </div>
              </div>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconShield />
              </span>
              <div>
                <div className="settings-row__label">Обработка запросов</div>
                <div className="settings-row__desc">
                  Тексты передаются на сервер только для обработки ИИ-моделью и
                  не сохраняются после ответа
                </div>
              </div>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconInfo />
              </span>
              <div>
                <div className="settings-row__label">Важно</div>
                <div className="settings-row__desc">
                  Не вводите реальные пароли, коды из SMS или номера банковских
                  карт в поля ввода
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="О приложении" fullWidth>
        <div className="settings-group">
          <div className="settings-info-block">
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconDevice />
              </span>
              <div>
                <div className="settings-row__label">Приложение</div>
                <div className="settings-row__desc">
                  Vantoryx — Защита от мошенников с помощью ИИ
                </div>
              </div>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconStar />
              </span>
              <div>
                <div className="settings-row__label">Версия</div>
                <div className="settings-row__desc">v0.1.0</div>
              </div>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconPerson />
              </span>
              <div>
                <div className="settings-row__label">Разработчик</div>
                <div className="settings-row__desc">MrRooty aka Amir</div>
              </div>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-icon">
                <IconLinux />
              </span>
              <div>
                <div className="settings-row__label">Деплой</div>
                <div className="settings-row__desc">Ubuntu 22.04 LTS · TLS 1.3</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Grid>
  );
}
