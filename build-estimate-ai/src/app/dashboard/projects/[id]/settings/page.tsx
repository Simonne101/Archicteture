import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";
import { TechnicalSettingsClient } from "@/components/dashboard/technical-settings-client";

export default async function TechnicalSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.verifiedData) notFound();

  return <TechnicalSettingsClient project={project} />;
}
