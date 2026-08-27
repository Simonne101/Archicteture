import type { IconTile } from "../types/content";
import { useInView } from "../hooks/useInView";

interface WorkflowStepProps extends IconTile {
  index: number;
}

export default function WorkflowStep({
  icon: Icon,
  title,
  description,
  iconClassName,
  bgClassName,
  index,
}: WorkflowStepProps) {
  const { ref, isInView } = useInView<HTMLElement>();

  return (
    <article
      ref={ref}
      style={{ animationDelay: isInView ? `${index * 80}ms` : undefined }}
      className={`flex min-h-[115px] w-full flex-1 gap-3.5 rounded-2xl border border-black/10 bg-surface p-4 shadow-[0_5px_14px_rgba(3,18,38,0.05)] transition-shadow hover:shadow-[0_10px_24px_rgba(3,18,38,0.1)] lg:w-[210px] lg:flex-none ${
        isInView ? "animate-fade-up" : "opacity-0"
      }`}
    >
      <span className={`grid h-[54px] w-[54px] flex-none place-items-center rounded-2xl ${bgClassName} ${iconClassName}`}>
        <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div>
        <h3 className="mb-1.5 text-[11px] font-bold text-text-dark">{title}</h3>
        <p className="text-[9.5px] leading-relaxed text-text-dark/65">{description}</p>
      </div>
    </article>
  );
}
