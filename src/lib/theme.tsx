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
  // NOTE: no imperative favicon juggling here on purpose. Removing or
  // appending <link> nodes behind React's back detaches fibers React still
  // tracks for its hoisted head elements — the next route commit then
  // crashes deleting them (removeChild of null) and bricks SPA routing.
  // The icon link is rendered declaratively by the root layout instead.
}

const ThemeContext = createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ mode: "base", setMode: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

/** Request a theme change from anywhere (e.g. the contact dial module).
 * Applies class + favicon + sessionStorage immediately and notifies the
 * provider via event so React state stays in sync. */
export function requestThemeMode(mode: ThemeMode) {
  applyTheme(mode);
  try {
    sessionStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  document.dispatchEvent(new CustomEvent<ThemeMode>("app:theme", { detail: mode }));
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
    requestThemeMode(m);
  }, []);

  // Sync when something outside React (legacy hooks, dial module) requests a theme.
  useEffect(() => {
    const onExternal = (e: Event) => {
      const m = (e as CustomEvent<ThemeMode>).detail;
      if (isThemeMode(m)) setModeState(m);
    };
    document.addEventListener("app:theme", onExternal);
    return () => document.removeEventListener("app:theme", onExternal);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
