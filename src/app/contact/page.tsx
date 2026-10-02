import type { Metadata } from "next";
import pagesDataRaw from "@/data/pages.json";

const pagesData = pagesDataRaw as Record<
  string,
  { key: string; title: string; description: string; namespace: string; html: string }
>;

export const metadata: Metadata = {
  title: pagesData.contact.title,
  description: pagesData.contact.description,
};

export default function ContactPage() {
  return (
    <main
      data-barba-namespace="contact"
      data-barba="container"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: pagesData.contact.html }}
    />
  );
}
