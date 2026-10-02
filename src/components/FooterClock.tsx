"use client";

import { useEffect, useState } from "react";

function now() {
  const d = new Date();
  return {
    h: String(d.getHours()).padStart(2, "0"),
    m: String(d.getMinutes()).padStart(2, "0"),
  };
}

export function FooterHours({ className, id }: { className?: string; id?: string }) {
  const [h, setH] = useState("--");
  useEffect(() => {
    setH(now().h);
    const t = setInterval(() => setH(now().h), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <h1 data-reveal="text" id={id} className={className} suppressHydrationWarning>
      {h}
    </h1>
  );
}

export function FooterMinutes({ className, id }: { className?: string; id?: string }) {
  const [m, setM] = useState("--");
  useEffect(() => {
    setM(now().m);
    const t = setInterval(() => setM(now().m), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <h1 data-reveal="text" id={id} className={className} suppressHydrationWarning>
      {m}
    </h1>
  );
}
