import { notFound } from "next/navigation";
import { getProject } from "@/lib/queries";
import { VerificationClient } from "@/components/dashboard/verification-client";

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.detectedData) notFound();

  return <VerificationClient project={project} />;
}
