import type { IconTile } from "../types/content";

interface BenefitItemProps extends IconTile {
  bordered?: boolean;
}

export default function BenefitItem({ icon: Icon, title, description, iconClassName, bordered = false }: BenefitItemProps) {
  return (
    <article className={`flex gap-3.5 px-0 lg:px-5 ${bordered ? "lg:border-r lg:border-white/10" : ""}`}>
      <span className={`flex-none ${iconClassName}`}>
        <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <div>
        <h3 className="mb-1 text-[11px] font-bold">{title}</h3>
        <p className="text-[9.5px] leading-relaxed text-text-muted">{description}</p>
      </div>
    </article>
  );
}
