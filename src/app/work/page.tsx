import type { Metadata } from "next";
import pagesDataRaw from "@/data/pages.json";

const pagesData = pagesDataRaw as Record<
  string,
  { key: string; title: string; description: string; namespace: string; html: string }
>;

export const metadata: Metadata = {
  title: pagesData.works.title,
  description: pagesData.works.description,
};

export default function WorkPage() {
  return (
    <main
      data-barba-namespace="works"
      data-barba="container"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: pagesData.works.html }}
    />
  );
}
