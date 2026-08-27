import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Stepper, { type WorkspaceStep } from "../components/workspace/Stepper";
import ProjectInputForm from "../components/workspace/ProjectInputForm";
import PlanUpload from "../components/workspace/PlanUpload";
import AnalysisReview from "../components/workspace/AnalysisReview";
import EstimateResults from "../components/workspace/EstimateResults";
import StatusBadge from "../components/ui/StatusBadge";
import { projectService } from "../services/project.service";
import { projectInputService } from "../services/projectInput.service";
import { plansService } from "../services/plans.service";
import { analysisService } from "../services/analysis.service";
import { estimateService } from "../services/estimate.service";
import { reportService } from "../services/report.service";
import { metaService } from "../services/meta.service";
import { ApiError } from "../services/api";
import type { Estimate, Meta, Plan, PlanAnalysis, Project, ProjectInput, Report } from "../services/types";

interface Workflow {
  plan_id?: string;
  analysis_id?: string;
  estimate_id?: string;
  report_id?: string;
}

export default function ProjectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [input, setInput] = useState<ProjectInput | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [step, setStep] = useState<WorkspaceStep>("input");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingManual, setIsStartingManual] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  const persistWorkflow = useCallback(
    async (patch: Workflow) => {
      if (!id || !project) return;
      const workflow = { ...(project.metadata?.workflow as Workflow | undefined), ...patch };
      const updated = await projectService.update(id, { metadata: { ...project.metadata, workflow } });
      setProject(updated);
    },
    [id, project],
  );

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [loadedProject, loadedMeta, loadedInput] = await Promise.all([
          projectService.get(id),
          metaService.get(),
          projectInputService.get(id),
        ]);
        setProject(loadedProject);
        setMeta(loadedMeta);
        setInput(loadedInput);

        const workflow = loadedProject.metadata?.workflow as Workflow | undefined;

        if (workflow?.plan_id) {
          const loadedPlan = await plansService.get(workflow.plan_id);
          setPlan(loadedPlan);
          setStep("upload");
        }
        if (workflow?.analysis_id) {
          const loadedAnalysis = await analysisService.get(workflow.analysis_id);
          setAnalysis(loadedAnalysis);
          setStep("analysis");
        }
        if (workflow?.estimate_id) {
          const loadedEstimate = await estimateService.get(workflow.estimate_id);
          setEstimate(loadedEstimate);
          setStep("estimate");
        }
        if (workflow?.report_id) {
          setReport(await reportService.get(workflow.report_id));
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Impossible de charger ce projet.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  async function handleEstimateWithoutPlan() {
    if (!id) return;
    setWorkflowError(null);
    setIsStartingManual(true);
    try {
      const manualAnalysis = await analysisService.startFromProjectInput(id);
      setAnalysis(manualAnalysis);
      await persistWorkflow({ analysis_id: manualAnalysis.id });
      setStep("estimate");
    } catch (err) {
      setWorkflowError(err instanceof ApiError ? err.message : "Impossible de lancer l'estimation.");
    } finally {
      setIsStartingManual(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light lg:min-h-[calc(100vh-82px)]">
        <p className="text-sm text-text-dark/60">Chargement du projet...</p>
      </main>
    );
  }

  if (error || !project || !id) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light lg:min-h-[calc(100vh-82px)]">
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Projet introuvable."}
        </p>
      </main>
    );
  }

  const reached: WorkspaceStep[] = ["input"];
  if (plan) reached.push("upload");
  // The "analysis" panel needs a Plan to render — a manually-derived
  // analysis (no plan uploaded) skips straight to "estimate" instead.
  if (plan && analysis) reached.push("analysis");
  if (analysis?.is_confirmed) reached.push("estimate");

  return (
    <main className="min-h-[calc(100vh-70px)] bg-bg-light px-5 py-12 lg:min-h-[calc(100vh-82px)] lg:px-10 xl:px-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-dark/60 hover:text-text-dark">
          <ArrowLeft size={16} aria-hidden="true" />
          Mes projets
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-text-dark">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>

        <Stepper current={step} reached={reached} onSelect={setStep} />

        {step === "input" && (
          <div className="flex flex-col gap-5">
            <ProjectInputForm projectId={id} input={input!} onSaved={setInput} />

            {workflowError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {workflowError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Continuer vers l&apos;import du plan →
              </button>

              {input?.can_estimate && (
                <button
                  type="button"
                  onClick={handleEstimateWithoutPlan}
                  disabled={isStartingManual}
                  className="text-sm font-semibold text-text-dark/70 hover:text-text-dark hover:underline disabled:opacity-60"
                >
                  {isStartingManual ? "Préparation..." : "Ou estimer directement sans plan →"}
                </button>
              )}
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="flex flex-col gap-5">
            <PlanUpload
              projectId={id}
              meta={meta}
              onUploaded={(uploaded) => {
                setPlan(uploaded);
                void persistWorkflow({ plan_id: uploaded.id });
                setStep("analysis");
              }}
            />
            {plan && (
              <button type="button" onClick={() => setStep("analysis")} className="self-start text-sm font-semibold text-primary hover:underline">
                Continuer vers l&apos;analyse →
              </button>
            )}
          </div>
        )}

        {step === "analysis" && plan && (
          <AnalysisReview
            plan={plan}
            analysis={analysis}
            onAnalysisChange={(updated) => {
              setAnalysis(updated);
              void persistWorkflow({ analysis_id: updated.id });
            }}
            onConfirmed={(confirmed) => {
              setAnalysis(confirmed);
              setStep("estimate");
            }}
          />
        )}

        {step === "estimate" && analysis && (
          <EstimateResults
            projectId={id}
            analysis={analysis}
            estimate={estimate}
            onEstimateChange={(updated) => {
              setEstimate(updated);
              void persistWorkflow({ estimate_id: updated.id });
            }}
            report={report}
            onReportChange={(updated) => {
              setReport(updated);
              void persistWorkflow({ report_id: updated.id });
            }}
          />
        )}
      </div>
    </main>
  );
}
