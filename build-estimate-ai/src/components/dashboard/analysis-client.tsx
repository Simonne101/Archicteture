"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, ScanSearch, Sparkles } from "lucide-react";
import { PlanViewer } from "@/components/dashboard/plan-viewer";
import { ConfidenceBadge } from "@/components/dashboard/confidence-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DetectedField, Project } from "@/lib/types";
import { runAnalysisAction } from "@/actions/projects";

const ANALYSIS_STEPS = [
  "Envoi du document à l'IA…",
  "Lecture du plan par Gemini (vision)…",
  "Détection des dimensions et murs…",
  "Identification des pièces…",
  "Calcul des niveaux de confiance…",
];

export function AnalysisClient({ project }: { project: Project }) {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startAnalysis() {
    setAnalyzing(true);
    setStepIndex(0);
    intervalRef.current = setInterval(() => {
      setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length);
    }, 2200);

    runAnalysisAction(project.id)
      .then((result) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setAnalyzing(false);
        if (result.success) {
          router.refresh();
        } else {
          toast.error(result.error ?? "L'analyse a échoué.");
        }
      })
      .catch((err) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setAnalyzing(false);
        toast.error(err instanceof Error ? err.message : "L'analyse a échoué.");
      });
  }

  const detected = project.detectedData;
  const fields: DetectedField[] = detected
    ? [
        detected.longueur,
        detected.largeur,
        detected.surface,
        detected.niveaux,
        detected.hauteurSousPlafond,
        detected.longueurMurs,
        detected.nombrePortes,
        detected.nombreFenetres,
      ]
    : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Analyse du plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Le système identifie les informations exploitables du plan importé.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="h-[520px]">
          <PlanViewer
            fileUrl={project.planFile?.url || null}
            kind={project.planFile?.kind ?? "image"}
            fileName={project.planFile?.name ?? "plan"}
          />
        </div>

        <Card className="flex flex-col gap-4 p-5">
          {!detected && !analyzing && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ScanSearch className="size-6" />
              </div>
              <div>
                <p className="font-medium">Prêt à analyser ce plan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  L&apos;analyse détecte les dimensions, pièces et éléments
                  structurels visibles sur le plan.
                </p>
              </div>
              <Button onClick={startAnalysis} className="gap-2">
                <Sparkles className="size-4" />
                Lancer l&apos;analyse
              </Button>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-1 flex-col justify-center gap-5 py-10">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ScanSearch className="size-6 animate-pulse" />
                </div>
                <p className="text-sm font-medium">
                  {ANALYSIS_STEPS[stepIndex]}
                </p>
              </div>
              <Progress value={((stepIndex + 1) / ANALYSIS_STEPS.length) * 100} />
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </div>
          )}

          {detected && !analyzing && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold">
                  Informations détectées
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startAnalysis}
                  className="text-xs text-muted-foreground"
                >
                  Relancer l&apos;analyse
                </Button>
              </div>

              {detected.resumeAnalyse && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5">
                  <ConfidenceBadge score={detected.confidenceGlobale} />
                  <p className="text-sm text-muted-foreground">{detected.resumeAnalyse}</p>
                </div>
              )}

              {detected.avertissements.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3.5 py-2.5">
                  {detected.avertissements.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col divide-y overflow-hidden rounded-lg border">
                {fields.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                  >
                    <span className="text-sm text-muted-foreground">
                      {f.label}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-medium tabular-nums">
                        {f.value}
                        {f.unit ? ` ${f.unit}` : ""}
                      </span>
                      <ConfidenceBadge score={f.score} />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Pièces identifiées ({detected.pieces.length})
                </p>
                <div className="flex flex-col divide-y overflow-hidden rounded-lg border">
                  {detected.pieces.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2"
                    >
                      <span className="text-sm">{room.label}</span>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {room.surface} m²
                        </span>
                        <ConfidenceBadge score={room.score} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="mt-1 gap-2"
                onClick={() => router.push(`/dashboard/projects/${project.id}/verification`)}
              >
                Vérifier les données
                <ArrowRight className="size-4" />
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
