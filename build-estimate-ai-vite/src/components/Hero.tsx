import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, Star, Upload } from "lucide-react";
import HeroVisualization from "./HeroVisualization";
import DemoModal from "./DemoModal";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";

const avatars = ["JD", "MA", "FS", "RK"];

export default function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);

  function handleUploadClick() {
    // Uploading a plan requires a project to attach it to — send the user
    // to create one (or sign up first) rather than accepting a file here
    // with nowhere real to put it.
    navigate(user ? "/projects/new" : "/register");
  }

  return (
    <section
      id="accueil"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_56%_46%,#0c2a4b_0,transparent_36%),linear-gradient(120deg,#03162e,#020d21)] px-5 pb-10 pt-8 text-white sm:px-8 md:grid md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-8 md:px-[4%] md:py-12 md:min-h-[560px] lg:grid-cols-[42%_58%] lg:gap-10 lg:px-[5%] lg:pt-10 lg:min-h-[600px]"
    >
      <div className="relative z-10 max-w-[500px]">
        <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[10px] text-primary">
          <Sparkles size={13} aria-hidden="true" />
          IA SPÉCIALISÉE DANS LA CONSTRUCTION
        </div>

        <h1 className="mb-3 text-[31px] font-extrabold leading-[1.14] tracking-tight sm:text-[38px] lg:text-[clamp(36px,2.75vw,42px)]">
          Vos plans.
          <br />
          Notre intelligence.
          <br />
          Vos <span className="text-primary">estimations précises.</span>
        </h1>

        <p className="mb-5 max-w-[440px] text-[13px] leading-relaxed text-text-muted sm:text-[15px]">
          Téléchargez le plan de votre maison et obtenez en quelques minutes l&apos;estimation
          détaillée des matériaux nécessaires, de la fondation jusqu&apos;au toit.
        </p>

        <div className="mb-5 flex flex-col gap-3.5 sm:flex-row">
          <Button onClick={handleUploadClick} className="h-[47px]">
            <Upload size={17} strokeWidth={2.1} aria-hidden="true" />
            Télécharger un plan
          </Button>
          <Button variant="outline" className="h-[47px]" onClick={() => setDemoOpen(true)}>
            <Play size={15} fill="currentColor" aria-hidden="true" />
            Voir une démo
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex">
            {avatars.map((initials, i) => (
              <span
                key={initials}
                className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#d5dbe2] to-[#526174] text-[9px] text-bg-dark ${
                  i === 0 ? "" : "-ml-2"
                }`}
              >
                {initials}
              </span>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex gap-0.5 text-accent-orange" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </span>
              <b>4,8/5</b>
            </div>
            <small className="block text-[11px] leading-snug text-text-muted">
              Plus de 1 200 architectes et ingénieurs
              <br />
              nous font déjà confiance.
            </small>
          </div>
        </div>
      </div>

      <HeroVisualization />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
