import { Check } from "lucide-react";

export type WorkspaceStep = "input" | "upload" | "analysis" | "estimate";

const steps: { key: WorkspaceStep; label: string }[] = [
  { key: "input", label: "Informations" },
  { key: "upload", label: "Plan" },
  { key: "analysis", label: "Analyse" },
  { key: "estimate", label: "Estimation" },
];

export default function Stepper({
  current,
  reached,
  onSelect,
}: {
  current: WorkspaceStep;
  reached: WorkspaceStep[];
  onSelect: (step: WorkspaceStep) => void;
}) {
  return (
    <ol className="mb-8 flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const isReached = reached.includes(step.key);
        const isCurrent = step.key === current;
        return (
          <li key={step.key}>
            <button
              type="button"
              disabled={!isReached}
              onClick={() => onSelect(step.key)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isCurrent
                  ? "border-primary bg-primary text-white"
                  : isReached
                    ? "border-black/10 bg-surface text-text-dark hover:border-primary/40"
                    : "cursor-not-allowed border-black/5 bg-black/[0.02] text-text-dark/30"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isCurrent ? "bg-white/20" : "bg-black/5"
                }`}
              >
                {isReached && !isCurrent ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              {step.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
