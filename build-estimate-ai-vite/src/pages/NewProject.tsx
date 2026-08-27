import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { buttonClasses } from "../utils/buttonStyles";
import Field from "../components/ui/Field";
import Select from "../components/ui/Select";
import { projectService } from "../services/project.service";
import { metaService } from "../services/meta.service";
import { ApiError } from "../services/api";
import type { Meta } from "../services/types";

const typeLabels: Record<string, string> = {
  maison_individuelle: "Maison individuelle",
  villa: "Villa",
  immeuble: "Immeuble",
  bureau: "Bureau",
  commerce: "Commerce",
  etablissement_public: "Établissement public",
  autre: "Autre",
};

export default function NewProject() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    metaService.get().then((m) => {
      setMeta(m);
      setCountryCode(m.countries[0]?.code ?? "");
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!countryCode) {
      setError("Veuillez sélectionner un pays.");
      return;
    }

    setIsSubmitting(true);

    try {
      const project = await projectService.create({
        name,
        description: description || undefined,
        project_type: projectType || undefined,
        location: location || undefined,
        country_code: countryCode,
      });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de créer le projet. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light px-5 py-16 lg:min-h-[calc(100vh-82px)]">
      <div className="w-full max-w-lg rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.08)]">
        <Link to="/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-dark/60 hover:text-text-dark">
          <ArrowLeft size={16} aria-hidden="true" />
          Mes projets
        </Link>

        <h1 className="mb-1 text-2xl font-extrabold text-text-dark">Nouveau projet</h1>
        <p className="mb-6 text-sm text-text-dark/60">
          Commencez par les informations générales — vous pourrez tout compléter ensuite.
        </p>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field
            label="Nom du projet"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Villa Almadies"
          />
          <Field
            label="Description (facultatif)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Maison R+1 avec terrasse"
          />
          <Select
            label="Type de construction"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="Sélectionner un type"
            options={(meta?.construction_types ?? []).map((t) => ({ value: t, label: typeLabels[t] ?? t }))}
          />
          <Field
            label="Localisation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Dakar, Sénégal"
          />
          <Select
            label="Pays"
            required
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            options={(meta?.countries ?? []).map((c) => ({ value: c.code, label: c.name }))}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonClasses("primary", "mt-2 h-12 w-full disabled:opacity-60 disabled:cursor-not-allowed")}
          >
            {isSubmitting ? "Création..." : "Créer le projet"}
          </button>
        </form>
      </div>
    </main>
  );
}
