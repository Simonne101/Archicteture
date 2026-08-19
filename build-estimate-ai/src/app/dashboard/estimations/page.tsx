import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";
import { getProjects } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/format";
import { BUILDING_TYPE_LABELS } from "@/lib/types";

export default async function EstimationsPage() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((p) => p.result);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Estimations" />
      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Estimations de matériaux générées pour l&apos;ensemble de vos projets.
        </p>

        {projects.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-14 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune estimation générée pour le moment.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/projects/new">Démarrer un projet</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} className="gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {BUILDING_TYPE_LABELS[p.buildingType]} · {p.approxSurface} m²
                    </p>
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Calculator className="size-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Béton</p>
                    <p className="font-medium tabular-nums">
                      {formatNumber(p.result!.totals.betonM3)} m³
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ciment</p>
                    <p className="font-medium tabular-nums">
                      {formatNumber(p.result!.totals.cimentSacs, 0)} sacs
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold">
                    {formatCurrency(p.result!.coutEstimeFCFA)}
                  </span>
                  <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
                    <Link href={`/dashboard/projects/${p.id}/results`}>
                      Voir
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
