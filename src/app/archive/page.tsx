import type { Metadata } from "next";
import pagesDataRaw from "@/data/pages.json";

const pagesData = pagesDataRaw as Record<
  string,
  { key: string; title: string; description: string; namespace: string; html: string }
>;

export const metadata: Metadata = {
  title: pagesData.archive.title,
  description: pagesData.archive.description,
};

export default function ArchivePage() {
  return (
    <main
      data-page="archive"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: pagesData.archive.html }}
    />
  );
}
