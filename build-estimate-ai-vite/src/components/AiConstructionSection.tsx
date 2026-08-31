import { Zap } from "lucide-react";
import planAnalyse from "../assets/images/plan-analyse.png";
import Button from "./Button";
import { useInView } from "../hooks/useInView";
import { scrollToSection } from "../utils/scroll";

const points = [
  "Détection automatique des murs, ouvertures et structures",
  "Mesures précises des surfaces et volumes",
  "Reconnaissance des matériaux par contexte",
  "Adaptation aux normes locales",
];

export default function AiConstructionSection() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section className="bg-bg-light px-5 py-14 sm:px-[5%] lg:py-20">
      <div
        ref={ref}
        className={`mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
          isInView ? "animate-fade-up" : "opacity-0"
        }`}
      >
        <div>
          <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[10px] text-primary">
            <Zap size={13} aria-hidden="true" />
            ESTIMATION INTELLIGENTE
          </div>

          <h2 className="mb-3 text-2xl font-bold leading-tight text-text-dark sm:text-[27px]">
            L&apos;IA au service de la construction moderne
          </h2>

          <p className="mb-5 max-w-[440px] text-sm leading-relaxed text-text-dark/65">
            Notre technologie analyse vos plans avec une précision exceptionnelle pour identifier
            chaque élément de votre construction. Fini les estimations approximatives et les
            erreurs coûteuses.
          </p>

          <ul className="mb-6 flex flex-col gap-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-text-dark/80">
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
                {point}
              </li>
            ))}
          </ul>

          <Button type="button" onClick={() => scrollToSection("comment")}>
            En savoir plus
          </Button>
        </div>

        <div>
          <img
            src={planAnalyse}
            alt="Plan architectural analysé par l'IA avec détection des murs, ouvertures et structures"
            className="w-full rounded-2xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}
