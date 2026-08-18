import { notFound } from "next/navigation";
import { archiveProjects } from "@/data/content";
import { ProjectDetail } from "@/components/project-detail";

export function generateStaticParams() { return archiveProjects.map((project) => ({ slug: project.slug })); }

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = archiveProjects.find((item) => item.slug === slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
