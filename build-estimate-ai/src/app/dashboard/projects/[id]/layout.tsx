import Link from "next/link";
import { getProject } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { WizardShell } from "@/components/dashboard/wizard-shell";
import { Button } from "@/components/ui/button";

export default async function ProjectWizardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return (
      <div className="flex flex-1 flex-col">
        <DashboardTopbar title="Projet introuvable" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ce projet est introuvable ou a été supprimé.
          </p>
          <Button size="sm" asChild>
            <Link href="/dashboard/projects">Retour aux projets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <WizardShell project={project}>{children}</WizardShell>;
}
