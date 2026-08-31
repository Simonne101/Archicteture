import Hero from "../components/Hero";
import FeatureStrip from "../components/FeatureStrip";
import AiConstructionSection from "../components/AiConstructionSection";
import HowItWorks from "../components/HowItWorks";
import QuantitiesReportsSection from "../components/QuantitiesReportsSection";
import FinalCtaBanner from "../components/FinalCtaBanner";
import BenefitsBar from "../components/BenefitsBar";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureStrip />
      <AiConstructionSection />
      <HowItWorks />
      <QuantitiesReportsSection />
      <FinalCtaBanner />
      <BenefitsBar />
    </main>
  );
}
