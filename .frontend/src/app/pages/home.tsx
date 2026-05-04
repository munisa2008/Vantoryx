import { Link } from "react-router-dom";
import { Card, Grid, Pill, Row } from "../../ui/components";
import { IconLink, IconMessage, IconMic, IconShield, IconTimer, IconWand } from "../../ui/icons";

export function HomePage() {
  return (
    <Grid>
      <Card
        title="Добро пожаловать"
        hint="Vantoryx помогает выявить мошенничество до того, как вы потеряете деньги или данные. Выберите режим ниже или в меню."
        fullWidth
      >
        <Row wrap>
          <Pill tone="neutral">Начните с «Проверка текста»</Pill>
          <Pill tone="neutral">Для ссылок — «Проверка ссылок»</Pill>
          <Pill tone="safe">Данные не сохраняются</Pill>
        </Row>
      </Card>

      <Card title="Режимы" hint="Выберите инструмент для анализа." fullWidth>
        <div className="tiles">
          <Link className="tile" to="/text">
            <IconShield />
            <div>
              <div className="tile__t">Проверка текста</div>
              <div className="tile__d">Оценка риска и причины</div>
            </div>
          </Link>
          <Link className="tile" to="/links">
            <IconLink />
            <div>
              <div className="tile__t">Проверка ссылок</div>
              <div className="tile__d">Извлечение URL и риск</div>
            </div>
          </Link>
          <Link className="tile" to="/what-to-reply">
            <IconMessage />
            <div>
              <div className="tile__t">Что ответить</div>
              <div className="tile__d">Безопасный ответ и чеклист</div>
            </div>
          </Link>
          <Link className="tile" to="/rewrite">
            <IconWand />
            <div>
              <div className="tile__t">Переписать честно</div>
              <div className="tile__d">Раскрыть истинный смысл</div>
            </div>
          </Link>
          <Link className="tile" to="/reverse">
            <IconTimer />
            <div>
              <div className="tile__t">Обратный фишинг</div>
              <div className="tile__d">Тянущий время ответ</div>
            </div>
          </Link>
          <Link className="tile" to="/audio">
            <IconMic />
            <div>
              <div className="tile__t">Аудио</div>
              <div className="tile__d">Запись и анализ разговора</div>
            </div>
          </Link>
        </div>
      </Card>
    </Grid>
  );
}
