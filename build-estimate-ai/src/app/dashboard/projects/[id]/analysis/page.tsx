import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";
import { AnalysisClient } from "@/components/dashboard/analysis-client";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return <AnalysisClient project={project} />;
}
