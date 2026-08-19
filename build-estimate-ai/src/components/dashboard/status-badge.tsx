import { PROJECT_STATUS_LABELS, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<ProjectStatus, string> = {
  brouillon: "bg-muted text-muted-foreground border-border",
  plan_importe: "bg-sky-50 text-sky-700 border-sky-200",
  analyse: "bg-violet-50 text-violet-700 border-violet-200",
  verifie: "bg-amber-50 text-amber-700 border-amber-200",
  calcule: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[status],
        className
      )}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
