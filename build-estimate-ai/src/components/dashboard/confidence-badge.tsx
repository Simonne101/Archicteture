import { Confidence, confidenceFromScore } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<Confidence, string> = {
  haute: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moyenne: "bg-amber-50 text-amber-700 border-amber-200",
  faible: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS: Record<Confidence, string> = {
  haute: "Confiance haute",
  moyenne: "Confiance moyenne",
  faible: "Confiance faible",
};

export function ConfidenceBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level = confidenceFromScore(score);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[level],
        className
      )}
      title={`${LABELS[level]} — ${Math.round(score * 100)}%`}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          level === "haute" && "bg-emerald-500",
          level === "moyenne" && "bg-amber-500",
          level === "faible" && "bg-rose-500"
        )}
      />
      {Math.round(score * 100)}%
    </span>
  );
}
