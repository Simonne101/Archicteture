import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  key: string;
  label: string;
  href: string;
}

export function buildWizardSteps(id: string): WizardStep[] {
  return [
    { key: "infos", label: "Informations & plan", href: "/dashboard/projects/new" },
    { key: "analysis", label: "Analyse", href: `/dashboard/projects/${id}/analysis` },
    { key: "verification", label: "Vérification", href: `/dashboard/projects/${id}/verification` },
    { key: "settings", label: "Paramètres", href: `/dashboard/projects/${id}/settings` },
    { key: "results", label: "Estimation", href: `/dashboard/projects/${id}/results` },
  ];
}

export function WizardStepper({
  steps,
  current,
  reachable,
}: {
  steps: WizardStep[];
  current: string;
  reachable: string[];
}) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Étapes du projet" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 sm:gap-1.5">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const isReachable = reachable.includes(step.key);
          const content = (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  active ? "text-foreground" : "text-muted-foreground",
                  !isReachable && "opacity-60"
                )}
              >
                {step.label}
              </span>
            </div>
          );
          return (
            <li key={step.key} className="flex items-center gap-1 sm:gap-1.5">
              {isReachable && !active ? (
                <Link href={step.href} className="rounded-md px-1.5 py-1 hover:bg-accent">
                  {content}
                </Link>
              ) : (
                <div className="px-1.5 py-1">{content}</div>
              )}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-4 shrink-0 sm:w-8",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
