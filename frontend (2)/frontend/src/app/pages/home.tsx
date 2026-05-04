import { Link } from "react-router-dom";
import { Card, Grid, Pill, Row } from "../../ui/components";
import { IconLink, IconMessage, IconMic, IconShield, IconTimer, IconWand } from "../../ui/icons";

export function HomePage() {
  return (
    <Grid>
      <Card
        title="Vantoryx"
        hint="Защитим вас от мошенников. Проверим текст, ссылки и звонки за секунды — до того, как вы что-то потеряете."
        fullWidth
      >
        <Row wrap>
          <Pill tone="neutral">Не знаете с чего начать? — «Текст»</Pill>
          <Pill tone="safe">Ничего не сохраняем</Pill>
        </Row>
      </Card>

      <Card title="Инструменты" hint="Выберите подходящий — каждый под свою задачу." fullWidth>
        <div className="tiles">
          <Link className="tile" to="/text">
            <IconShield />
            <div>
              <div className="tile__t">Текст</div>
              <div className="tile__d">Оценим риск сообщения</div>
            </div>
          </Link>
          <Link className="tile" to="/links">
            <IconLink />
            <div>
              <div className="tile__t">Ссылки</div>
              <div className="tile__d">Найдём подозрительные URL</div>
            </div>
          </Link>
          <Link className="tile" to="/what-to-reply">
            <IconMessage />
            <div>
              <div className="tile__t">Что ответить</div>
              <div className="tile__d">Готовый безопасный ответ</div>
            </div>
          </Link>
          <Link className="tile" to="/rewrite">
            <IconWand />
            <div>
              <div className="tile__t">Истинный смысл</div>
              <div className="tile__d">Раскроем уловки в тексте</div>
            </div>
          </Link>
          <Link className="tile" to="/reverse">
            <IconTimer />
            <div>
              <div className="tile__t">Обратный фишинг</div>
              <div className="tile__d">Потяните время — узнаем больше</div>
            </div>
          </Link>
          <Link className="tile" to="/audio">
            <IconMic />
            <div>
              <div className="tile__t">Аудио</div>
              <div className="tile__d">Анализ разговора по записи</div>
            </div>
          </Link>
        </div>
      </Card>
    </Grid>
  );
}
