import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";
import { ResultsClient } from "@/components/dashboard/results-client";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.result) notFound();

  return <ResultsClient project={project} />;
}
