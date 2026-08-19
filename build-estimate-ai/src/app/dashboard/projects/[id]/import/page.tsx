import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";
import { ImportPlanClient } from "@/components/dashboard/import-plan-client";

export default async function ImportPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return <ImportPlanClient project={project} />;
}
