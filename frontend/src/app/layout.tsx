import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  IconClose,
  IconHistory,
  IconHome,
  IconInfo,
  IconLink,
  IconMenu,
  IconMessage,
  IconMic,
  IconPerson,
  IconPulse,
  IconSettings,
  IconShield,
  IconTimer,
  IconWand,
} from "../ui/icons";

const allNav = [
  { to: "/", label: "Обзор", desc: "Главная страница", icon: <IconHome /> },
  { to: "/status", label: "Статус", desc: "Доступность сервера и ИИ", icon: <IconPulse /> },
  { to: "/text", label: "Проверка текста", desc: "Анализ сообщений на мошенничество", icon: <IconShield /> },
  { to: "/links", label: "Проверка ссылок", desc: "Извлечение и оценка URL", icon: <IconLink /> },
  { to: "/what-to-reply", label: "Что ответить", desc: "Безопасный ответ на подозрительное сообщение", icon: <IconMessage /> },
  { to: "/rewrite", label: "Переписать честно", desc: "Раскрыть манипулятивный текст", icon: <IconWand /> },
  { to: "/reverse", label: "Обратный фишинг", desc: "Тянущий время ответ + самопроверка", icon: <IconTimer /> },
  { to: "/audio", label: "Аудио", desc: "Запись и анализ разговора", icon: <IconMic /> },
  { to: "/history", label: "История", desc: "Последние проверки из всех режимов", icon: <IconHistory /> },
  { to: "/help", label: "Справка", desc: "Как использовать приложение", icon: <IconInfo /> },
  { to: "/about", label: "О приложении", desc: "Разработчик и технологии", icon: <IconPerson /> },
  { to: "/settings", label: "Настройки", desc: "Тема и параметры приложения", icon: <IconSettings /> },
];

// Bottom nav: 4 main + "More" button
const bottomNavItems = [allNav[0], allNav[2], allNav[3], allNav[7]];

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const currentPage = allNav.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="app">
      {/* ── Navigation Drawer ── */}
      <nav className={`nav-drawer${drawerOpen ? " nav-drawer--open" : ""}`} aria-label="Навигация">
        <div className="nav-drawer__header">
          <div className="brand">
            <span className="brand__dot" />
            <span className="brand__name">Vantoryx</span>
          </div>
          <button
            className="icon-btn nav-drawer__close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Закрыть меню"
          >
            <IconClose />
          </button>
        </div>

        <div className="nav__group">
          {allNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav__item${isActive ? " nav__item--active" : ""}`}
            >
              {item.icon}
              <div className="nav__item-text">
                <span className="nav__label">{item.label}</span>
                <span className="nav__desc">{item.desc}</span>
              </div>
            </NavLink>
          ))}
        </div>

        <div className="nav-drawer__footer">
          <span className="nav-drawer__privacy">Конфиденциально — данные не сохраняются</span>
        </div>
      </nav>

      {/* ── Backdrop (mobile/tablet) ── */}
      <div
        className={`nav-backdrop${drawerOpen ? " nav-backdrop--visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── Main column ── */}
      <div className="main-col">
        {/* Top App Bar */}
        <header className="topbar">
          <button
            className="icon-btn topbar__menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Открыть меню"
          >
            <IconMenu />
          </button>
          <span className="topbar__title">{currentPage?.label ?? "Vantoryx"}</span>
          <div className="topbar__right">
            <span className="topbar__hint">Конфиденциально</span>
          </div>
        </header>

        {/* Content area with optional rail */}
        <div className="app-body">
          {/* Nav Rail (tablet only) */}
          <nav className="nav-rail" aria-label="Быстрая навигация">
            {allNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `rail__item${isActive ? " rail__item--active" : ""}`}
                title={item.label}
              >
                <span className="rail__indicator">{item.icon}</span>
                <span className="rail__label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Bottom Navigation (mobile only) ── */}
      <nav className="bottom-nav" aria-label="Основная навигация">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`}
          >
            <span className="bottom-nav__indicator">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
        <button
          className="bottom-nav__item"
          onClick={() => setDrawerOpen(true)}
          aria-label="Все разделы"
        >
          <span className="bottom-nav__indicator">
            <IconMenu />
          </span>
          <span className="bottom-nav__label">Ещё</span>
        </button>
      </nav>
    </div>
  );
}
