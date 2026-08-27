import { Scan } from "lucide-react";

export default function AnalysisCard() {
  return (
    <div className="absolute left-[4%] top-2 hidden max-w-[220px] items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-bg-dark-2/95 to-bg-dark/95 p-3.5 shadow-2xl backdrop-blur-md animate-float sm:flex md:hidden lg:flex">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/20 text-primary">
        <Scan size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <strong className="block text-xs text-white">Analyse intelligente</strong>
        <small className="text-[9px] leading-relaxed text-text-muted">
          Détection des murs, ouvertures, surfaces et structures...
        </small>
      </div>
    </div>
  );
}
