import heroComposition from "../assets/images/hero-composition.webp";
import AnalysisCard from "./AnalysisCard";
import PrecisionCard from "./PrecisionCard";
import MaterialEstimationCard from "./MaterialEstimationCard";

export default function HeroVisualization() {
  return (
    <div className="relative mx-auto mt-6 h-[340px] w-full max-w-[560px] overflow-hidden rounded-2xl sm:h-[420px] md:mt-0 md:h-full md:min-h-[420px] md:max-w-none md:overflow-visible md:rounded-none">
      <img
        src={heroComposition}
        alt="Maison contemporaine en perspective devant son plan architectural"
        className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
      />

      <AnalysisCard />
      <PrecisionCard />
      <MaterialEstimationCard />
    </div>
  );
}
