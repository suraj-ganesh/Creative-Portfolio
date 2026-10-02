import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import CaseStudyView from "@/components/works/CaseStudyView";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    return { title: "Work - bleibtgleich" };
  }
  return {
    title: `${project.title} - bleibtgleich`,
    description: project.description,
    openGraph: {
      title: `${project.title} - bleibtgleich`,
      description: project.description,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function WorkCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    notFound();
  }

  return <CaseStudyView project={project} />;
}
