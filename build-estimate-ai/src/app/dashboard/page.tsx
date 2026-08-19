import Link from "next/link";
import {
  FolderKanban,
  ScanSearch,
  Calculator,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { getProjects } from "@/lib/queries";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BUILDING_TYPE_LABELS } from "@/lib/types";
import { formatRelativeDate } from "@/lib/format";
import { wizardHrefForProject } from "@/lib/wizard-nav";

export default async function DashboardPage() {
  const projects = await getProjects();

  const plansAnalyses = projects.filter((p) => p.detectedData).length;
  const estimationsGenerees = projects.filter((p) => p.result).length;
  const dernier = projects[0];
  const recents = projects.slice(0, 5);

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar />
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Bonjour, bienvenue sur BuildEstimate AI.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Voici un aperçu de votre activité et de vos projets récents.
            </p>
          </div>
          <Button asChild className="gap-1.5">
            <Link href="/dashboard/projects/new">
              <Plus className="size-4" />
              Nouveau projet
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Projets créés" value={String(projects.length)} icon={FolderKanban} />
          <StatCard label="Plans analysés" value={String(plansAnalyses)} icon={ScanSearch} />
          <StatCard
            label="Estimations générées"
            value={String(estimationsGenerees)}
            icon={Calculator}
          />
          <StatCard
            label="Dernier projet"
            value={dernier ? dernier.name : "Aucun"}
            trend={dernier ? formatRelativeDate(dernier.updatedAt) : undefined}
            icon={Clock}
          />
        </div>

        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-heading font-semibold">Projets récents</h2>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Voir tout
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {recents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Vous n&apos;avez pas encore de projet.
              </p>
              <Button size="sm" asChild>
                <Link href="/dashboard/projects/new">Créer mon premier projet</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recents.map((p) => (
                <li key={p.id}>
                  <Link
                    href={wizardHrefForProject(p)}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {BUILDING_TYPE_LABELS[p.buildingType]} · {p.location || "Localisation non renseignée"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(p.updatedAt)}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
