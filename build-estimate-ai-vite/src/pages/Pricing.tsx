import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { buttonClasses } from "../utils/buttonStyles";

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    description: "Pour tester Build Estimate AI sur un premier projet.",
    features: ["3 plans par mois", "Estimation des matériaux principaux", "Export PDF simple"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "49 000 FCFA / mois",
    description: "Pour les architectes et bureaux d'études actifs.",
    features: [
      "Plans illimités",
      "Analyse IA détaillée (structures, niveaux, ouvertures)",
      "Rapports professionnels partageables",
      "Support prioritaire",
    ],
    highlighted: true,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    description: "Pour les bureaux d'études et entreprises BTP.",
    features: ["Multi-utilisateurs", "Intégration API", "Accompagnement dédié"],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <main className="bg-bg-light px-5 py-16 sm:px-[5%]">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-3 text-3xl font-extrabold text-text-dark sm:text-4xl">Tarifs</h1>
        <p className="text-sm text-text-dark/60 sm:text-base">
          Choisissez l&apos;offre adaptée à la taille de vos projets de construction.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl border p-6 shadow-[0_14px_34px_rgba(3,18,38,0.06)] ${
              plan.highlighted ? "border-primary bg-bg-dark text-white" : "border-black/10 bg-surface text-text-dark"
            }`}
          >
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className={`mt-1 text-2xl font-extrabold ${plan.highlighted ? "text-primary" : "text-text-dark"}`}>
              {plan.price}
            </p>
            <p className={`mt-2 text-sm ${plan.highlighted ? "text-text-muted" : "text-text-dark/60"}`}>
              {plan.description}
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                  <span className={plan.highlighted ? "text-text-muted" : "text-text-dark/80"}>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={
                plan.highlighted
                  ? buttonClasses("primary", "mt-6 w-full")
                  : `mt-6 flex h-12 w-full items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-text-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary`
              }
            >
              Commencer
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
