import { Link } from "react-router-dom";
import { BarChart3, FileCheck2 } from "lucide-react";
import chantierFondation from "../assets/images/chantier-fondation.png";
import rapportEstimation from "../assets/images/rapport-estimation.png";
import Button from "./Button";
import { useInView } from "../hooks/useInView";

const quantitiesPoints = [
  "Calculs basés sur les normes de construction",
  "Quantités détaillées par type et matériau",
  "Prise en compte des pertes et coefficients",
  "Export aux formats Excel, PDF et CSV",
];

const reportsPoints = [
  "Rapports personnalisables à votre image",
  "Détails techniques et quantitatifs complets",
  "Graphiques et visualisations inclus",
  "Partage sécurisé avec vos collaborateurs",
];

function CheckIcon() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent-green/10 text-accent-green">
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
        <path
          d="M4 10.5 8 14.5 16 5.5"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function QuantitiesReportsSection() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="bg-bg-light px-5 py-14 sm:px-[5%] lg:py-20">
      <div
        ref={ref}
        className={`mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 ${isInView ? "animate-fade-up" : "opacity-0"}`}
      >
        <article className="flex flex-col gap-6 rounded-2xl border border-black/10 bg-surface p-6 shadow-[0_5px_14px_rgba(3,18,38,0.05)] sm:flex-row sm:items-center lg:p-8">
          <img
            src={chantierFondation}
            alt="Deux professionnels du BTP consultant les quantités de matériaux calculées sur un chantier"
            className="h-40 w-full flex-none rounded-xl object-cover sm:h-full sm:w-40"
            style={{ objectPosition: "68% center" }}
          />
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[9px] text-primary">
              <BarChart3 size={12} aria-hidden="true" />
              QUANTITÉS PRÉCISES
            </div>
            <h3 className="mb-2 text-lg font-bold text-text-dark">
              Des quantités fiables pour mieux planifier
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-text-dark/65">
              Obtenez des estimations précises de tous les matériaux nécessaires à votre projet.
              Planifiez vos achats, optimisez vos coûts et évitez les ruptures de chantier.
            </p>
            <ul className="mb-5 flex flex-col gap-2">
              {quantitiesPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[13px] text-text-dark/80">
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>
            <Button as={Link} to="/projects/new">
              Découvrir nos calculs
            </Button>
          </div>
        </article>

        <article className="flex flex-col gap-6 rounded-2xl border border-black/10 bg-surface p-6 shadow-[0_5px_14px_rgba(3,18,38,0.05)] sm:flex-row-reverse sm:items-center lg:p-8">
          <img
            src={rapportEstimation}
            alt="Rapport d'estimation professionnel prêt à être exporté et partagé"
            className="h-40 w-full flex-none rounded-xl object-cover sm:h-full sm:w-40"
          />
          <div>
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[9px] text-primary">
              <FileCheck2 size={12} aria-hidden="true" />
              RAPPORTS PROFESSIONNELS
            </div>
            <h3 className="mb-2 text-lg font-bold text-text-dark">
              Des rapports complets et prêts à partager
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-text-dark/65">
              Générez des rapports détaillés et professionnels en quelques clics. Parfaits pour
              vos présentations clients, demandes de devis ou suivi de chantier.
            </p>
            <ul className="mb-5 flex flex-col gap-2">
              {reportsPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[13px] text-text-dark/80">
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>
            <Button as={Link} to="/demo">
              Voir un exemple
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
