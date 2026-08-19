import Link from "next/link";
import { Users, FolderKanban, CheckCircle2, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [totalUsers, activeUsers, totalProjects, completedProjects, recentProjects, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "calcule" } }),
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { user: { select: { name: true } } },
      }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Vue générale</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Activité de la plateforme BuildEstimate AI.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Comptes utilisateurs" value={String(totalUsers)} icon={Users} trend={`${activeUsers} actifs`} />
        <StatCard label="Projets créés" value={String(totalProjects)} icon={FolderKanban} />
        <StatCard label="Estimations finalisées" value={String(completedProjects)} icon={CheckCircle2} />
        <StatCard
          label="Taux de complétion"
          value={totalProjects > 0 ? `${Math.round((completedProjects / totalProjects) * 100)}%` : "—"}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="font-heading text-base">Projets récents</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y p-0">
            {recentProjects.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">Aucun projet pour le moment.</p>
            )}
            {recentProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.user.name} · {formatDate(p.updatedAt.toISOString())}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {PROJECT_STATUS_LABELS[p.status as ProjectStatus] ?? p.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="flex-row items-center justify-between border-b py-4">
            <CardTitle className="font-heading text-base">Derniers comptes créés</CardTitle>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/admin/users">
                Gérer <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y p-0">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(u.createdAt.toISOString())}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
