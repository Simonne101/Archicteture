import { features } from "../data/content";
import FeatureCard from "./FeatureCard";

export default function FeatureStrip() {
  return (
    <section
      id="fonctionnalites"
      className="relative z-10 mx-[3%] -mt-px grid grid-cols-1 gap-6 bg-surface p-6 shadow-[0_14px_34px_rgba(3,18,38,0.08)] sm:grid-cols-2 sm:rounded-2xl lg:mx-[5%] lg:grid-cols-4 lg:gap-0 lg:rounded-[20px] lg:p-8"
    >
      {features.map((feature, i) => (
        <FeatureCard key={feature.title} {...feature} bordered={i < features.length - 1} />
      ))}
    </section>
  );
}
