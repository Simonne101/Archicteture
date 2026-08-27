import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { buttonClasses } from "../../utils/buttonStyles";
import Field from "../ui/Field";
import { analysisService } from "../../services/analysis.service";
import { ApiError } from "../../services/api";
import type { Measurement, Plan, PlanAnalysis } from "../../services/types";

const categoryLabels: Record<Measurement["category"], string> = {
  room: "Pièce",
  wall: "Mur",
  opening: "Ouverture",
  level: "Niveau",
  area: "Surface",
  structure: "Structure",
};

export default function AnalysisReview({
  plan,
  analysis,
  onAnalysisChange,
  onConfirmed,
}: {
  plan: Plan;
  analysis: PlanAnalysis | null;
  onAnalysisChange: (analysis: PlanAnalysis) => void;
  onConfirmed: (analysis: PlanAnalysis) => void;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const isRunning = analysis?.status === "queued" || analysis?.status === "processing";

  useEffect(() => {
    if (!isRunning || !analysis) return;

    pollRef.current = window.setInterval(async () => {
      try {
        const updated = await analysisService.get(analysis.id);
        onAnalysisChange(updated);
      } catch {
        // transient poll failure — retried on next tick
      }
    }, 2500);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, analysis?.id]);

  async function startAnalysis() {
    setError(null);
    setIsStarting(true);
    try {
      const started = await analysisService.start(plan.id);
      onAnalysisChange(started);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de lancer l'analyse.");
    } finally {
      setIsStarting(false);
    }
  }

  async function updateMeasurement(measurement: Measurement, field: keyof Measurement, raw: string) {
    if (!analysis) return;
    const value = raw === "" ? undefined : Number(raw);
    try {
      const updated = await analysisService.updateMeasurement(analysis.id, measurement.id, { [field]: value });
      onAnalysisChange({
        ...analysis,
        measurements: analysis.measurements.map((m) => (m.id === updated.id ? updated : m)),
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour de la mesure.");
    }
  }

  async function confirm() {
    if (!analysis) return;
    setError(null);
    setIsConfirming(true);
    try {
      const confirmed = await analysisService.confirm(analysis.id);
      onConfirmed(confirmed);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de confirmer l'analyse.");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
      <h3 className="mb-1 font-bold text-text-dark">Analyse intelligente</h3>
      <p className="mb-5 text-sm text-text-dark/60">
        L&apos;IA détecte les éléments du plan — vérifiez et corrigez avant de continuer.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {!analysis && (
        <button type="button" onClick={startAnalysis} disabled={isStarting} className={buttonClasses("primary", "h-11 px-5 disabled:opacity-60")}>
          <Sparkles size={16} aria-hidden="true" />
          {isStarting ? "Lancement..." : "Lancer l'analyse"}
        </button>
      )}

      {isRunning && (
        <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-text-dark">
          <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
          Analyse du plan en cours...
        </div>
      )}

      {analysis?.status === "failed" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          L&apos;analyse a échoué : {analysis.error_message ?? "erreur inconnue."}
        </p>
      )}

      {analysis && (analysis.status === "completed" || analysis.status === "needs_review") && (
        <>
          <p className="mb-4 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-text-dark">
            {analysis.status === "needs_review"
              ? "Analyse terminée mais nécessite une vérification manuelle (confiance faible)."
              : "Analyse terminée."}{" "}
            Confiance :{" "}
            {analysis.confidence_score !== null ? `${Math.round(analysis.confidence_score * 100)}%` : "n/d"}
          </p>

          <ul className="mb-5 flex flex-col gap-3">
            {analysis.measurements.map((m) => (
              <li key={m.id} className="rounded-xl border border-black/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-dark">
                    {categoryLabels[m.category]} — {m.label ?? "Sans nom"}
                  </span>
                  <span className="text-xs text-text-dark/40">
                    {m.source === "ai"
                      ? `IA (${m.confidence !== null ? Math.round(m.confidence * 100) + "%" : "n/d"})`
                      : "Corrigé"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {m.length !== null && (
                    <Field label={`Longueur (${m.unit})`} type="number" min={0} step="0.01" defaultValue={m.length} onBlur={(e) => updateMeasurement(m, "length", e.target.value)} />
                  )}
                  {m.width !== null && (
                    <Field label={`Largeur (${m.unit})`} type="number" min={0} step="0.01" defaultValue={m.width} onBlur={(e) => updateMeasurement(m, "width", e.target.value)} />
                  )}
                  {m.height !== null && (
                    <Field label={`Hauteur (${m.unit})`} type="number" min={0} step="0.01" defaultValue={m.height} onBlur={(e) => updateMeasurement(m, "height", e.target.value)} />
                  )}
                  {m.surface !== null && (
                    <Field label={`Surface (${m.unit})`} type="number" min={0} step="0.01" defaultValue={m.surface} onBlur={(e) => updateMeasurement(m, "surface", e.target.value)} />
                  )}
                  {m.thickness !== null && (
                    <Field label={`Épaisseur (${m.unit})`} type="number" min={0} step="0.01" defaultValue={m.thickness} onBlur={(e) => updateMeasurement(m, "thickness", e.target.value)} />
                  )}
                </div>
              </li>
            ))}
            {analysis.measurements.length === 0 && (
              <li className="text-sm text-text-dark/50">Aucun élément détecté.</li>
            )}
          </ul>

          <button type="button" onClick={confirm} disabled={isConfirming} className={buttonClasses("primary", "h-11 px-5 disabled:opacity-60")}>
            {isConfirming ? "Confirmation..." : "Confirmer les données"}
          </button>
        </>
      )}
    </div>
  );
}
