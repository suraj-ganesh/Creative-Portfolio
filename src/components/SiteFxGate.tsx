"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isLowPower } from "@/lib/fx/core";

const SiteFx = dynamic(() => import("./SiteFx"), { ssr: false });

export default function SiteFxGate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timer = 0;
    if (!isLowPower()) {
      setMounted(true);
      return;
    }
    const schedule = () => {
      timer = window.setTimeout(() => setMounted(true), 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
    };
  }, []);

  return mounted ? <SiteFx /> : null;
}
