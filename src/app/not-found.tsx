import type { Metadata } from "next";
import pagesDataRaw from "@/data/pages.json";

const pagesData = pagesDataRaw as Record<
  string,
  { key: string; title: string; description: string; namespace: string; html: string }
>;

export const metadata: Metadata = {
  title: "404 Not Found - bleibtgleich",
};

export default function NotFound() {
  return (
    <main
      data-barba-namespace="error-404"
      data-barba="container"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: pagesData["404"].html }}
    />
  );
}
