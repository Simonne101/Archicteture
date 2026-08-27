import Hero from "../components/Hero";
import FeatureStrip from "../components/FeatureStrip";
import HowItWorks from "../components/HowItWorks";
import BenefitsBar from "../components/BenefitsBar";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureStrip />
      <HowItWorks />
      <BenefitsBar />
    </main>
  );
}
