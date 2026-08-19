import Link from "next/link";
import { FileBarChart, ArrowRight } from "lucide-react";
import { getProjects } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default async function ReportsPage() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((p) => p.result);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Rapports" />
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Rapports d&apos;estimation disponibles pour export et partage.
        </p>

        {projects.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun rapport disponible pour le moment.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/projects/new">Démarrer un projet</Link>
            </Button>
          </Card>
        ) : (
          <Card className="gap-0 divide-y p-0">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileBarChart className="size-4.5" />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Généré le {formatDate(p.result!.computedAt)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-1.5">
                  <Link href={`/dashboard/projects/${p.id}/report`}>
                    Ouvrir le rapport
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
