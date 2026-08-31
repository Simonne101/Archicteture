import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import maisonNuit from "../assets/images/maison-nuit.png";
import Button from "./Button";
import DemoModal from "./DemoModal";
import { useInView } from "../hooks/useInView";
import { useAuth } from "../context/AuthContext";

const trustPoints = ["Aucune carte requise", "Essai gratuit 14 jours", "Annulez à tout moment"];

export default function FinalCtaBanner() {
  const { ref, isInView } = useInView<HTMLDivElement>();
  const [demoOpen, setDemoOpen] = useState(false);
  const { user } = useAuth();

  return (
    <section className="px-0 pb-10 sm:px-[1%] lg:px-[2.8%]">
      <div
        ref={ref}
        className={`grid gap-8 overflow-hidden rounded-none bg-gradient-to-r from-bg-dark-2 to-bg-dark px-6 py-10 text-white sm:rounded-2xl lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:px-12 lg:py-14 ${
          isInView ? "animate-fade-up" : "opacity-0"
        }`}
      >
        <div>
          <h2 className="mb-3 text-2xl font-bold leading-tight sm:text-[27px]">
            Prêt à transformer
            <br />
            vos plans en réalité ?
          </h2>
          <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-text-muted">
            Rejoignez plus de 1 200 professionnels qui nous font déjà confiance pour leurs
            estimations de construction.
          </p>

          <div className="mb-6 flex flex-col gap-3.5 sm:flex-row">
            <Button as={Link} to={user ? "/projects" : "/register"}>
              Commencer gratuitement
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Button>
            <Button variant="outline" onClick={() => setDemoOpen(true)}>
              <Play size={15} fill="currentColor" aria-hidden="true" />
              Voir une démonstration
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-muted">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3 text-accent-green" aria-hidden="true">
                  <path
                    d="M4 10.5 8 14.5 16 5.5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[200px] sm:h-[260px] lg:h-full lg:min-h-[260px]">
          <img
            src={maisonNuit}
            alt="Maison contemporaine illuminée de nuit"
            className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
