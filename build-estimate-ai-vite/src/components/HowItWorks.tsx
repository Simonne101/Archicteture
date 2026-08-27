import { ArrowRight } from "lucide-react";
import { workflowSteps } from "../data/content";
import WorkflowStep from "./WorkflowStep";

export default function HowItWorks() {
  return (
    <section id="comment" className="px-5 py-10 sm:px-[5%]">
      <h2 className="mb-6 text-center text-2xl font-bold text-text-dark sm:text-[27px]">
        Comment ça marche ?
      </h2>

      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-4">
        {workflowSteps.map((step, i) => (
          <div key={step.title} className="flex items-center gap-4 lg:contents">
            <WorkflowStep {...step} index={i} />
            {i < workflowSteps.length - 1 && (
              <ArrowRight
                size={20}
                strokeWidth={2}
                className="hidden flex-none text-text-dark/30 lg:block"
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
