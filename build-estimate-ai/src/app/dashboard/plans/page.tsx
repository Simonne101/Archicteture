import Link from "next/link";
import { FileText, Image as ImageIcon, Plus } from "lucide-react";
import { getProjects } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatFileSize } from "@/lib/format";
import { wizardHrefForProject } from "@/lib/wizard-nav";

export default async function PlansPage() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((p) => p.planFile);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Plans" />
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Tous les plans architecturaux importés dans vos projets.
          </p>
          <Button asChild className="gap-1.5">
            <Link href="/dashboard/projects/new">
              <Plus className="size-4" />
              Importer un plan
            </Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun plan importé pour le moment.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/projects/new">Importer mon premier plan</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={wizardHrefForProject(p)}>
                <Card className="gap-3 p-5 transition-colors hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {p.planFile!.kind === "pdf" ? (
                        <FileText className="size-4.5" />
                      ) : (
                        <ImageIcon className="size-4.5" />
                      )}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div>
                    <p className="truncate font-medium">{p.planFile!.name}</p>
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(p.planFile!.size)}</span>
                    <span>{formatDate(p.updatedAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
