import type { Metadata } from "next";
import pagesDataRaw from "@/data/pages.json";

const pagesData = pagesDataRaw as Record<
  string,
  { key: string; title: string; description: string; namespace: string; html: string }
>;

export const metadata: Metadata = {
  title: "Suraj Ganesh",
};

export default function NotFound() {
  // The static 404 markup ships the fallback totem SVG — swap it for the
  // main motion mark (theme-aware: dark mark on light themes, white mark
  // on dark mode, toggled via CSS below).
  const html = pagesData["404"].html.replace(
    /<div class="_404-icon">[\s\S]*?<\/svg>\s*<\/div>/,
    `<div class="_404-icon">` +
      `<img src="/images/hero-mark.png" alt="Suraj Ganesh" class="_404-logo is-dark" style="width:100%;height:auto;display:block" />` +
      `<img src="/images/hero-mark-white.png" alt="Suraj Ganesh" class="_404-logo is-white" style="width:100%;height:auto;display:none" />` +
      `</div>`,
  );
  return (
    <main
      data-page="error-404"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
