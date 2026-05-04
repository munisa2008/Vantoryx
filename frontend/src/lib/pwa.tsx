import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform = "android" | "ios" | "windows" | "linux" | "macos" | "unknown";

export interface PWAInstallCtx {
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  platform: Platform;
  install(): Promise<void>;
  dismiss(): void;
  showBanner: boolean;
}

const Ctx = createContext<PWAInstallCtx>({
  canInstall: false, isIOS: false, isStandalone: false,
  platform: "unknown",
  install: async () => {}, dismiss: () => {}, showBanner: false,
});

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  if (/macintosh|mac os x/.test(ua)) return "macos";
  if (/win/.test(ua)) return "windows";
  if (/linux/.test(ua)) return "linux";
  return "unknown";
}

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("pwa-banner-dismissed") === "1"
  );

  const platform = detectPlatform();
  const isIOS = platform === "ios";
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  useEffect(() => {
    const h = () => { setPrompt(null); setDismissed(true); };
    window.addEventListener("appinstalled", h);
    return () => window.removeEventListener("appinstalled", h);
  }, []);

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") { setPrompt(null); setDismissed(true); }
  }

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  const showBanner = !isStandalone && !dismissed && (!!prompt || isIOS);

  return (
    <Ctx.Provider value={{ canInstall: !!prompt, isIOS, isStandalone, platform, install, dismiss, showBanner }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePWAInstall = () => useContext(Ctx);
