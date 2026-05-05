import { useEffect } from "react";

const DEFAULT_TITLE = "Vantoryx — защита от мошенников";
const DEFAULT_DESC =
  "Защита от мошенников: анализ текста, ссылок и звонков с помощью ИИ. Бесплатно, без регистрации.";

export function usePageMeta(opts: {
  title: string;
  description?: string;
  noindex?: boolean;
}) {
  useEffect(() => {
    document.title = opts.title;
    setMeta("description", opts.description ?? DEFAULT_DESC);
    setMeta("robots", opts.noindex ? "noindex,nofollow" : "index,follow");
    setOg("og:title", opts.title);
    setOg("og:description", opts.description ?? DEFAULT_DESC);
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("description", DEFAULT_DESC);
      setMeta("robots", "index,follow");
      setOg("og:title", DEFAULT_TITLE);
      setOg("og:description", DEFAULT_DESC);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.title, opts.description, opts.noindex]);
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}
