"use client";

import { useTheme, type ThemeMode } from "@/lib/theme";
import { runThemeLiquid } from "@/lib/fx/theme-liquid";
import { prefersReduced } from "@/lib/fx/core";

const LIQUID_COLOR: Record<ThemeMode, string> = {
  base: "#ffffff",
  "1": "#bec1ca",
  "2": "#FF633D",
  "3": "#919E44",
  "4": "#D5312F",
};

/** Contact-dial theme switch: liquid cover, theme swap mid-way, reveal. */
export default function DialThemeButton({ mode }: { mode: ThemeMode }) {
  const { mode: current, setMode } = useTheme();
  return (
    <div
      data-haptic="medium"
      data-theme-mode={mode}
      className="theme-switch-inner is-contect"
      role="button"
      aria-label={`Theme ${mode}`}
      aria-pressed={current === mode}
      onClick={(e) => {
        if (current === mode) return;
        if (prefersReduced()) {
          setMode(mode);
          return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        const x = (r.left + r.width / 2) / window.innerWidth;
        const y = (r.top + r.height / 2) / window.innerHeight;
        void runThemeLiquid(LIQUID_COLOR[mode], x, y);
        window.setTimeout(() => setMode(mode), 600);
      }}
    />
  );
}
