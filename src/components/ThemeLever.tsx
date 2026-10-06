"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useTheme } from "@/lib/theme";
import { prewarmThemeLiquid, runThemeLiquid } from "@/lib/fx/theme-liquid";
import { prefersReduced } from "@/lib/fx/core";

/** Minecraft wall-lever switch: fixed below the menu, always visible.
 *  Faux-3D cobblestone mount (top/front/side faces) with an extruded
 *  wooden stick. Stick up-left = light (base), mirrored up-right = dark.
 *  A status lamp on the mount glows red while dark mode is on. */
export default function ThemeLever() {
  const { mode, setMode } = useTheme();
  const isDark = mode === "4";
  const busy = useRef(false);
  const timer = useRef(0);

  // Compile the liquid-transition GL program while idle so the first
  // flip has no shader-compile hitch.
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => prewarmThemeLiquid());
      return () => w.cancelIdleCallback?.(id);
    }
    timer.current = window.setTimeout(() => prewarmThemeLiquid(), 1500);
    return () => window.clearTimeout(timer.current);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "base" : "4";
    if (prefersReduced()) {
      setMode(next);
      return;
    }
    if (busy.current) return;
    busy.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (r.left + r.width / 2) / window.innerWidth;
    const y = (r.top + r.height / 2) / window.innerHeight;
    void runThemeLiquid(next === "4" ? "#111111" : "#ffffff", x, y, 0.8);
    timer.current = window.setTimeout(() => {
      setMode(next);
      busy.current = false;
    }, 300);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark theme"
      data-haptic="medium"
      data-reveal="div"
      data-intro-step="7"
      data-reveal-delay="2.3"
      onClick={toggle}
      className="mc-lever"
      data-dark={isDark ? "on" : "off"}
    >
      <svg
        viewBox="0 0 48 56"
        width="100%"
        height="100%"
        aria-hidden="true"
        shapeRendering="crispEdges"
        className="mc-lever-svg"
      >
        <defs>
          <clipPath id="mc-lever-right">
            <polygon points="32,28 39,21 39,43 32,50" />
          </clipPath>
        </defs>
        {/* Mount top face (catches the light) */}
        <polygon points="10,28 17,21 39,21 32,28" fill="#a8a8a8" />
        <rect x="18" y="22" width="5" height="3" fill="#9c9c9c" />
        <rect x="25" y="22" width="5" height="3" fill="#bdbdbd" />
        <rect x="31" y="22" width="4" height="3" fill="#a3a3a3" />
        <polygon
          points="10,28 17,21 39,21 32,28"
          fill="none"
          stroke="#161616"
          strokeWidth="2"
        />
        {/* Mount right face (in shade) + stone cells */}
        <polygon points="32,28 39,21 39,43 32,50" fill="#545454" />
        <g clipPath="url(#mc-lever-right)">
          <rect x="33" y="30" width="5" height="4" fill="#484848" />
          <rect x="33" y="36" width="5" height="4" fill="#5c5c5c" />
          <rect x="34" y="42" width="4" height="3" fill="#484848" />
        </g>
        <polygon
          points="32,28 39,21 39,43 32,50"
          fill="none"
          stroke="#161616"
          strokeWidth="2"
        />
        {/* Mount front face + dense cobblestone mottling */}
        <rect x="10" y="28" width="22" height="22" fill="#7d7d7d" />
        <rect x="11" y="29" width="4" height="4" fill="#8c8c8c" />
        <rect x="16" y="29" width="4" height="3" fill="#5a5a5a" />
        <rect x="21" y="29" width="4" height="4" fill="#7f7f7f" />
        <rect x="26" y="29" width="4" height="3" fill="#686868" />
        <rect x="11" y="34" width="3" height="4" fill="#6e6e6e" />
        <rect x="15" y="33" width="5" height="4" fill="#9a9a9a" />
        <rect x="21" y="34" width="4" height="4" fill="#5f5f5f" />
        <rect x="26" y="33" width="4" height="5" fill="#858585" />
        <rect x="11" y="39" width="4" height="4" fill="#767676" />
        <rect x="16" y="39" width="4" height="4" fill="#4f4f4f" />
        <rect x="21" y="39" width="5" height="4" fill="#8c8c8c" />
        <rect x="27" y="39" width="3" height="4" fill="#666666" />
        <rect x="11" y="44" width="5" height="4" fill="#5a5a5a" />
        <rect x="17" y="44" width="4" height="4" fill="#7d7d7d" />
        <rect x="22" y="44" width="4" height="4" fill="#676767" />
        <rect x="27" y="44" width="3" height="4" fill="#565656" />
        <rect x="10" y="46" width="22" height="4" fill="#3f3f3f" />
        <rect
          x="10"
          y="28"
          width="22"
          height="22"
          fill="none"
          stroke="#161616"
          strokeWidth="2"
        />
        {/* Dark socket the stick sits in (upper-left of the mount) */}
        <rect x="16" y="28" width="9" height="8" fill="#1c1c1c" />
        <rect x="17" y="29" width="7" height="6" fill="#2e2e2e" />
        {/* Status lamp (lower-right of the mount): dim socket in light
            mode, glowing red while dark mode is on. */}
        <rect x="25" y="42" width="6" height="6" fill="#141414" />
        <rect x="25" y="42" width="6" height="1" fill="#2e2e2e" />
        <circle
          cx="28"
          cy="45"
          r="4.8"
          fill="#ff2a1a"
          opacity={isDark ? 0.4 : 0}
          style={{ transition: "opacity 0.35s ease" }}
        />
        <circle
          cx="28"
          cy="45"
          r="2.2"
          fill={isDark ? "#ff4030" : "#47211b"}
          style={{
            transition: "fill 0.35s ease, filter 0.35s ease",
            filter: isDark
              ? "drop-shadow(0 0 2.5px rgba(255,64,48,0.95))"
              : "none",
          }}
        />
        {/* Extruded wooden stick, pivot at (20,32).
            Light/off rests up-left like the sprite; dark mirrors it. */}
        <g
          style={{
            transform: isDark ? "rotate(40deg)" : "rotate(-40deg)",
            transformOrigin: "20px 32px",
            transformBox: "view-box",
            transition: "transform 0.28s cubic-bezier(0.5, 0, 0.3, 1.25)",
          }}
        >
          <rect x="19" y="5" width="6" height="28" fill="#33200f" />
          <rect x="18" y="2" width="8" height="5" fill="#33200f" />
          <rect x="17" y="4" width="6" height="28" fill="#6b4e2e" />
          <rect x="18" y="5" width="2" height="26" fill="#97744a" />
          <rect x="22" y="5" width="1" height="26" fill="#4a3319" />
          <rect x="16" y="1" width="8" height="5" fill="#755631" />
          <rect x="16" y="1" width="8" height="2" fill="#97744a" />
          <rect
            x="16"
            y="1"
            width="8"
            height="33"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
        </g>
        {/* Pivot bolt */}
        <rect x="18" y="30" width="4" height="4" fill="#242424" />
        <rect x="18" y="30" width="4" height="1" fill="#c6c6c6" />
      </svg>
    </button>
  );
}
