import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building, Building2, Home, Layers } from "lucide-react";
import { demoService, type DemoSummary } from "../services/demo.service";
import { ApiError } from "../services/api";

const icons: Record<string, typeof Home> = {
  "villa-plain-pied": Home,
  "villa-r1": Building2,
  "batiment-professionnel": Building,
  "projet-complet": Layers,
};

export default function Demo() {
  const [demos, setDemos] = useState<DemoSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    demoService
      .list()
      .then(setDemos)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Impossible de charger les démonstrations."));
  }, []);

  return (
    <main className="min-h-[calc(100vh-70px)] bg-bg-light px-5 py-16 lg:min-h-[calc(100vh-82px)] lg:px-10 xl:px-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-2 text-2xl font-extrabold text-text-dark sm:text-3xl">
          Choisissez une démonstration
        </h1>
        <p className="mb-10 text-sm text-text-dark/60">
          Données précalculées — aucune attente, aucun compte requis.
        </p>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {!demos && !error && <p className="text-sm text-text-dark/60">Chargement…</p>}

        {demos && (
          <ul className="grid gap-5 sm:grid-cols-2">
            {demos.map((demo) => {
              const Icon = icons[demo.slug] ?? Home;
              return (
                <li key={demo.slug}>
                  <Link
                    to={`/demo/${demo.slug}`}
                    className="flex h-full flex-col items-start gap-3 rounded-2xl border border-black/5 bg-surface p-6 text-left shadow-[0_14px_34px_rgba(3,18,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(3,18,38,0.1)]"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h2 className="font-bold text-text-dark">{demo.name}</h2>
                    <p className="text-sm text-text-dark/60">{demo.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Voir la démonstration
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
