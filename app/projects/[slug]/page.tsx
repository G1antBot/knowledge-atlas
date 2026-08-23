import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { archiveProjects } from "@/data/content";
import { ProjectDetail } from "@/components/project-detail";
import { createZhPageMetadata } from "@/lib/metadata";

type ProjectDetailPageProps = { params: Promise<{ slug: string }> };

function findProject(slug: string) {
  const project = archiveProjects.find((item) => item.slug === slug);
  if (!project) notFound();
  return project;
}

export function generateStaticParams() { return archiveProjects.map((project) => ({ slug: project.slug })); }

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  return createZhPageMetadata(project.title.zh, project.summary.zh);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = findProject(slug);
  return <ProjectDetail project={project} />;
}
