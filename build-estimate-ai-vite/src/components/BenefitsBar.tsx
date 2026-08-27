import { benefits } from "../data/content";
import BenefitItem from "./BenefitItem";

export default function BenefitsBar() {
  return (
    <section
      id="ressources"
      className="mx-0 grid grid-cols-1 gap-6 bg-gradient-to-r from-bg-dark-2 to-bg-dark px-6 py-8 text-white sm:mx-[1%] sm:grid-cols-2 sm:rounded-t-2xl lg:mx-[2.8%] lg:grid-cols-5 lg:gap-0 lg:px-8"
    >
      {benefits.map((benefit, i) => (
        <BenefitItem key={benefit.title} {...benefit} bordered={i < benefits.length - 1} />
      ))}
    </section>
  );
}
