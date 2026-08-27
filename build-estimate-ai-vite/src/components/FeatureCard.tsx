import type { IconTile } from "../types/content";

interface FeatureCardProps extends IconTile {
  bordered?: boolean;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  iconClassName,
  bgClassName,
  bordered = false,
}: FeatureCardProps) {
  return (
    <article className={`flex gap-4 px-0 lg:px-6 ${bordered ? "lg:border-r lg:border-black/10" : ""}`}>
      <span className={`grid h-14 w-14 flex-none place-items-center rounded-2xl ${bgClassName} ${iconClassName}`}>
        <Icon size={28} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div>
        <h3 className="mb-1.5 mt-1 text-[13px] font-bold text-text-dark">{title}</h3>
        <p className="text-[11px] leading-relaxed text-text-dark/65">{description}</p>
      </div>
    </article>
  );
}
