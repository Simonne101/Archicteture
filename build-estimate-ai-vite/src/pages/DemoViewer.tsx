import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, Sparkles } from "lucide-react";
import { buttonClasses } from "../utils/buttonStyles";
import Button from "../components/Button";
import { demoService, type DemoDetail } from "../services/demo.service";
import { ApiError } from "../services/api";

type Step = "plan" | "analysis" | "review" | "estimate" | "report";

const steps: { key: Step; label: string }[] = [
  { key: "plan", label: "Plan importé" },
  { key: "analysis", label: "Analyse intelligente" },
  { key: "review", label: "Vérifiez & ajustez" },
  { key: "estimate", label: "Estimation" },
  { key: "report", label: "Rapport" },
];

const categoryLabels: Record<string, string> = {
  room: "Pièce",
  wall: "Mur",
  opening: "Ouverture",
  level: "Niveau",
  area: "Surface",
  structure: "Structure",
};

export default function DemoViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [demo, setDemo] = useState<DemoDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("plan");

  useEffect(() => {
    if (!slug) return;
    setDemo(null);
    setStep("plan");
    demoService
      .get(slug)
      .then(setDemo)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Cette démonstration est introuvable."));
  }, [slug]);

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light px-5 lg:min-h-[calc(100vh-82px)]">
        <div className="text-center">
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  if (!demo) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light lg:min-h-[calc(100vh-82px)]">
        <p className="text-sm text-text-dark/60">Chargement de la démonstration…</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-bg-light px-5 py-12 lg:min-h-[calc(100vh-82px)] lg:px-10 xl:px-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-dark/60 hover:text-text-dark">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l'accueil
        </Link>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles size={12} aria-hidden="true" />
          Démonstration — données précalculées
        </div>
        <h1 className="mb-1 text-2xl font-extrabold text-text-dark">{demo.name}</h1>
        <p className="mb-8 text-sm text-text-dark/60">{demo.description}</p>

        <ol className="mb-8 flex flex-wrap gap-2">
          {steps.map((s, index) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(s.key)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  step === s.key
                    ? "border-primary bg-primary text-white"
                    : "border-black/10 bg-surface text-text-dark hover:border-primary/40"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    step === s.key ? "bg-white/20" : "bg-black/5"
                  }`}
                >
                  {index + 1}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>

        {step === "plan" && demo.plan && (
          <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <h3 className="mb-1 font-bold text-text-dark">Plan importé</h3>
            <p className="mb-5 text-sm text-text-dark/60">
              Formats acceptés : PDF, JPG, PNG. Dans cette démonstration, le plan est déjà chargé.
            </p>
            <div className="flex items-center gap-3 rounded-lg border border-accent-green/30 bg-accent-green/10 px-4 py-3 text-sm text-text-dark">
              <FileText size={18} className="text-accent-green" aria-hidden="true" />
              <span>
                <strong>{demo.plan.original_filename}</strong> — {demo.location}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep("analysis")}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
            >
              Voir l'analyse →
            </button>
          </div>
        )}

        {step === "analysis" && demo.analysis && (
          <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <h3 className="mb-1 font-bold text-text-dark">Analyse intelligente</h3>
            <p className="mb-5 flex items-center gap-2 text-sm text-text-dark/60">
              <CheckCircle2 size={16} className="text-accent-green" aria-hidden="true" />
              Analyse terminée — confiance{" "}
              {demo.analysis.confidence_score !== null ? `${Math.round(demo.analysis.confidence_score * 100)}%` : "n/d"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {demo.analysis.measurements.map((m) => (
                <div key={m.id} className="rounded-xl border border-black/5 p-4 text-sm">
                  <p className="mb-1 font-semibold text-text-dark">
                    {categoryLabels[m.category] ?? m.category} — {m.label ?? "Sans nom"}
                  </p>
                  <p className="text-text-dark/60">
                    {[
                      m.length !== null && `Long. ${m.length} ${m.unit}`,
                      m.width !== null && `Larg. ${m.width} ${m.unit}`,
                      m.height !== null && `Haut. ${m.height} ${m.unit}`,
                      m.surface !== null && `Surface ${m.surface} m²`,
                      m.thickness !== null && `Épais. ${m.thickness} ${m.unit}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("review")}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
            >
              Vérifier les données →
            </button>
          </div>
        )}

        {step === "review" && demo.analysis && (
          <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <h3 className="mb-1 font-bold text-text-dark">Vérifiez & ajustez</h3>
            <p className="mb-5 text-sm text-text-dark/60">
              Dans un vrai projet, chaque mesure détectée est modifiable ici avant de continuer.
              Cette démonstration présente des données déjà validées.
            </p>
            <p className="rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-text-dark">
              {demo.analysis.measurements.length} éléments détectés et confirmés.
            </p>
            <button
              type="button"
              onClick={() => setStep("estimate")}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
            >
              Voir l'estimation →
            </button>
          </div>
        )}

        {step === "estimate" && demo.estimate && (
          <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <h3 className="mb-1 font-bold text-text-dark">Estimation</h3>
            <p className="mb-4 rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-3 text-xs text-text-dark">
              {demo.estimate.warning}
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
                  {demo.estimate.items.map((item) => (
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
            <button
              type="button"
              onClick={() => setStep("report")}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Voir le rapport →
            </button>
          </div>
        )}

        {step === "report" && demo.report && (
          <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <h3 className="mb-1 font-bold text-text-dark">Rapport</h3>
            <p className="mb-5 text-sm text-text-dark/60">
              Le rapport complet reprend les informations du projet, les hypothèses utilisées et le détail des matériaux.
            </p>
            {demo.report.download_url && (
              <a href={demo.report.download_url} className={buttonClasses("primary", "h-11 px-5")}>
                <Download size={16} aria-hidden="true" />
                Télécharger le rapport de démonstration
              </a>
            )}

            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="mb-3 text-sm text-text-dark">
                Convaincu ? Créez votre compte et estimez votre propre projet en quelques minutes.
              </p>
              <Button as={Link} to="/register" className="mx-auto h-11 px-5">
                Créer mon compte gratuitement
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
