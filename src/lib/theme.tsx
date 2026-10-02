"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "base" | "1" | "2" | "3" | "4";

const THEME_CLASS: Record<ThemeMode, string> = {
  base: "theme-mode-base",
  "1": "theme-mode-1",
  "2": "theme-mode-2",
  "3": "theme-mode-3",
  "4": "theme-mode-4",
};

const FAVICON: Record<ThemeMode, string> = {
  base: "/favicons/favicon-mode_0.svg",
  "1": "/favicons/favicon-mode_1.svg",
  "2": "/favicons/favicon-mode_2.svg",
  "3": "/favicons/favicon-mode_3.svg",
  "4": "/favicons/favicon-mode_4.svg",
};

const STORAGE_KEY = "theme-mode";

function isThemeMode(v: string | null): v is ThemeMode {
  return v === "base" || v === "1" || v === "2" || v === "3" || v === "4";
}

function readStoredTheme(): ThemeMode {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (isThemeMode(v)) return v;
  } catch {
    /* private mode etc. */
  }
  return "base";
}

function applyTheme(mode: ThemeMode) {
  // Classes live on <html> (set pre-hydration in layout head to avoid
  // a theme flash); CSS vars inherit down to body like the legacy
  // bundle's body-level class did.
  const root = document.documentElement;
  for (const c of Object.values(THEME_CLASS)) root.classList.remove(c);
  root.classList.add(THEME_CLASS[mode]);

  const href = FAVICON[mode];
  const current = document.querySelector('link[rel~="icon"]');
  if (current?.getAttribute("href") !== href) {
    document
      .querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]')
      .forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = href;
    document.head.appendChild(link);
  }
}

const ThemeContext = createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ mode: "base", setMode: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("base");

  useEffect(() => {
    const stored = readStoredTheme();
    setModeState(stored);
    applyTheme(stored);

    // The legacy site-bundle also toggles theme classes (on body) until
    // the native migration is complete. Stay in sync if it changes them.
    const classToMode = new Map(
      Object.entries(THEME_CLASS).map(([m, c]) => [c, m as ThemeMode]),
    );
    const syncFromBody = () => {
      for (const c of document.body.classList) {
        const m = classToMode.get(c);
        if (m) {
          setModeState((prev) => (prev === m ? prev : m));
          return;
        }
      }
    };
    const obs = new MutationObserver(syncFromBody);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    applyTheme(m);
    try {
      sessionStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
