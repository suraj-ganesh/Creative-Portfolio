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
  return (
    <main
      data-page="error-404"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: pagesData["404"].html }}
    />
  );
}
