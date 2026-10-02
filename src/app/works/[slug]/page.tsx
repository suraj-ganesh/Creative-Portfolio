import type { Metadata } from "next";
import { notFound } from "next/navigation";
import worksDataRaw from "@/data/works.json";

interface WorkItem {
  slug: string;
  title: string;
  description: string;
  ogImage: string;
  namespace: string;
  html: string;
}

const worksData = worksDataRaw as Record<string, WorkItem>;

export async function generateStaticParams() {
  return Object.keys(worksData).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = worksData[slug];
  if (!work) {
    return { title: "Work - bleibtgleich" };
  }
  return {
    title: work.title,
    description: work.description,
    openGraph: {
      title: work.title,
      description: work.description,
      images: work.ogImage ? [{ url: work.ogImage }] : undefined,
    },
  };
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = worksData[slug];
  if (!work) {
    notFound();
  }

  return (
    <main
      data-barba-namespace={work.namespace || slug}
      data-barba="container"
      className="transition-container"
      dangerouslySetInnerHTML={{ __html: work.html }}
    />
  );
}
