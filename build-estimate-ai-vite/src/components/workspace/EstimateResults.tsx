import { useEffect, useRef, useState } from "react";
import { Loader2, Download, Calculator } from "lucide-react";
import { buttonClasses } from "../../utils/buttonStyles";
import { estimateService } from "../../services/estimate.service";
import { reportService } from "../../services/report.service";
import { ApiError } from "../../services/api";
import type { Estimate, PlanAnalysis, Report } from "../../services/types";

export default function EstimateResults({
  projectId,
  analysis,
  estimate,
  onEstimateChange,
  report,
  onReportChange,
}: {
  projectId: string;
  analysis: PlanAnalysis;
  estimate: Estimate | null;
  onEstimateChange: (estimate: Estimate) => void;
  report: Report | null;
  onReportChange: (report: Report) => void;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const reportPollRef = useRef<number | null>(null);

  const isCalculating = estimate?.status === "processing";
  const isReportProcessing = report?.status === "processing";

  useEffect(() => {
    if (!isCalculating || !estimate) return;
    pollRef.current = window.setInterval(async () => {
      try {
        onEstimateChange(await estimateService.get(estimate.id));
      } catch {
        // retried on next tick
      }
    }, 2500);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalculating, estimate?.id]);

  useEffect(() => {
    if (!isReportProcessing || !report) return;
    reportPollRef.current = window.setInterval(async () => {
      try {
        onReportChange(await reportService.get(report.id));
      } catch {
        // retried on next tick
      }
    }, 2500);
    return () => {
      if (reportPollRef.current) window.clearInterval(reportPollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReportProcessing, report?.id]);

  async function startEstimate() {
    setError(null);
    setIsStarting(true);
    try {
      onEstimateChange(await estimateService.create(projectId, analysis.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de générer l'estimation.");
    } finally {
      setIsStarting(false);
    }
  }

  async function generateReport() {
    if (!estimate) return;
    setError(null);
    setIsGeneratingReport(true);
    try {
      onReportChange(await reportService.create(estimate.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de générer le rapport.");
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
      <h3 className="mb-1 font-bold text-text-dark">Estimation</h3>
      <p className="mb-5 text-sm text-text-dark/60">
        Quantités de matériaux nécessaires, calculées à partir des données validées.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {!estimate && (
        <button type="button" onClick={startEstimate} disabled={isStarting} className={buttonClasses("primary", "h-11 px-5 disabled:opacity-60")}>
          <Calculator size={16} aria-hidden="true" />
          {isStarting ? "Lancement..." : "Calculer l'estimation"}
        </button>
      )}

      {isCalculating && (
        <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-text-dark">
          <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
          Calcul de l&apos;estimation...
        </div>
      )}

      {estimate?.status === "failed" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Le calcul a échoué : {estimate.error_message ?? "erreur inconnue."}
        </p>
      )}

      {estimate?.status === "completed" && (
        <>
          <p className="mb-4 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-3 text-xs text-text-dark">
            {estimate.warning}
          </p>

          <div className="mb-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-text-dark/60">
                  <th className="py-2 pr-4 font-semibold">Matériau</th>
                  <th className="py-2 font-semibold">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item) => (
                  <tr key={item.id} className="border-b border-black/5">
                    <td className="py-2.5 pr-4 text-text-dark">{item.description}</td>
                    <td className="py-2.5 tabular-nums text-text-dark">
                      {item.quantity.toLocaleString("fr-FR")} {item.unit}
                      {item.available_display_units.length > 0 && (
                        <div className="mt-0.5 text-xs font-normal text-text-dark/50">
                          {item.available_display_units.map((alt) => (
                            <span key={alt.unit}>
                              soit {alt.quantity.toLocaleString("fr-FR")} {alt.label.toLowerCase()}
                              {!alt.verified && " (indicatif)"}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!report && (
            <button type="button" onClick={generateReport} disabled={isGeneratingReport} className={buttonClasses("primary", "h-11 px-5 disabled:opacity-60")}>
              {isGeneratingReport ? "Génération..." : "Générer le rapport PDF"}
            </button>
          )}

          {isReportProcessing && (
            <div className="flex items-center gap-3 rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-text-dark">
              <Loader2 size={18} className="animate-spin text-primary" aria-hidden="true" />
              Génération du rapport...
            </div>
          )}

          {report?.status === "completed" && report.download_url && (
            <a href={report.download_url} className={buttonClasses("primary", "h-11 px-5")}>
              <Download size={16} aria-hidden="true" />
              Télécharger le rapport
            </a>
          )}
        </>
      )}
    </div>
  );
}
