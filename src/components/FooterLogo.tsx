"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function FooterLogo({ logos }: { logos: string[] }) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setActive((a) => (a + 1) % logos.length),
      5000,
    );
  }, [logos.length]);

  useEffect(() => {
    if (logos.length < 2) return;
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [logos.length, restart]);

  const advance = useCallback(() => {
    setActive((a) => (a + 1) % logos.length);
    restart();
  }, [logos.length, restart]);

  return (
    <div
      data-reveal="clip-down"
      className="footer-logo-cell"
      onClick={advance}
    >
      <div className="footer-logo-list-wrap w-dyn-list">
        <div role="list" className="footer-logo-list w-dyn-items">
          {logos.map((src, i) => (
            <div
              key={i}
              role="listitem"
              className="footer-logo-item w-dyn-item"
              style={
                i === active
                  ? { position: "relative", display: "block" }
                  : { position: "absolute", display: "none" }
              }
            >
              <img src={src} loading="lazy" alt="" className="img" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
