import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderOpen, Sparkles } from "lucide-react";
import { buttonClasses } from "../utils/buttonStyles";
import { projectService } from "../services/project.service";
import { ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import type { Project } from "../services/types";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    projectService
      .list()
      .then(setProjects)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger vos projets."));
  }, []);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-bg-light px-5 py-12 lg:min-h-[calc(100vh-82px)] lg:px-10 xl:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-text-dark">Mes projets</h1>
              {user?.account_type === "demo" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Sparkles size={12} aria-hidden="true" />
                  Mode démo — accès complet, sans limite
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-dark/60">
              Retrouvez vos estimations en cours et terminées.
            </p>
          </div>
          <Link to="/projects/new" className={buttonClasses("primary", "h-11 px-5")}>
            <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
            Nouveau projet
          </Link>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        {!projects && !error && (
          <p className="text-sm text-text-dark/60">Chargement…</p>
        )}

        {projects && projects.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-surface p-12 text-center shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
            <FolderOpen size={32} strokeWidth={1.6} className="text-text-dark/30" aria-hidden="true" />
            <p className="text-sm text-text-dark/60">
              Vous n&apos;avez encore aucun projet. Créez-en un pour commencer votre première estimation.
            </p>
            <Link to="/projects/new" className={buttonClasses("primary", "mt-2 h-11 px-5")}>
              Créer mon premier projet
            </Link>
          </div>
        )}

        {projects && projects.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={`/projects/${project.id}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-black/5 bg-surface p-6 shadow-[0_14px_34px_rgba(3,18,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(3,18,38,0.1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-bold text-text-dark">{project.name}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.location && <p className="text-sm text-text-dark/60">{project.location}</p>}
                  <p className="mt-auto pt-2 text-xs text-text-dark/40">
                    Mis à jour le {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
