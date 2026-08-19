"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { buildWizardSteps, WizardStepper } from "@/components/dashboard/wizard-stepper";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Project, ProjectStatus } from "@/lib/types";

const REACHABLE_BY_STATUS: Record<ProjectStatus, string[]> = {
  brouillon: [],
  plan_importe: ["analysis"],
  analyse: ["analysis", "verification"],
  verifie: ["analysis", "verification", "settings", "results"],
  calcule: ["analysis", "verification", "settings", "results"],
};

function stepKeyFromPath(pathname: string) {
  if (pathname.endsWith("/import")) return "infos";
  if (pathname.endsWith("/analysis")) return "analysis";
  if (pathname.endsWith("/verification")) return "verification";
  if (pathname.endsWith("/settings")) return "settings";
  if (pathname.endsWith("/results")) return "results";
  if (pathname.endsWith("/details")) return "results";
  if (pathname.endsWith("/report")) return "results";
  return "infos";
}

export function WizardShell({
  project,
  children,
}: {
  project: Project;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const steps = buildWizardSteps(project.id);
  const current = stepKeyFromPath(pathname);
  const reachable = REACHABLE_BY_STATUS[project.status];

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title={project.name} />
      <div className="print-hide flex flex-col gap-4 border-b bg-muted/30 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Tous les projets
          </Link>
          <StatusBadge status={project.status} />
        </div>
        <WizardStepper steps={steps} current={current} reachable={reachable} />
      </div>
      <div className="print-area flex-1 bg-muted/20 p-4 sm:p-6">{children}</div>
    </div>
  );
}
