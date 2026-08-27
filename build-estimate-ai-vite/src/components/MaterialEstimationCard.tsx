import { materials, rebarIcon, rebarRows } from "../data/content";

const RebarIcon = rebarIcon;

export default function MaterialEstimationCard() {
  return (
    <aside className="absolute right-0 top-2 w-[230px] rounded-2xl border border-white/15 bg-gradient-to-br from-bg-dark-2/95 to-bg-dark/95 p-4 text-white shadow-2xl backdrop-blur-md sm:w-[260px]">
      <h2 className="mb-2.5 text-[13px] font-semibold">Estimation des matériaux</h2>

      {materials.map(({ icon: Icon, label, value, unit, iconClassName }) => (
        <div
          key={label}
          className="grid h-11 grid-cols-[28px_1fr_auto] items-center border-t border-white/10 text-[11px]"
        >
          <span className={`inline-flex items-center ${iconClassName}`}>
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <b className="font-semibold">{label}</b>
          <strong className="text-right text-xs font-semibold">
            {value}
            <small className="block font-normal text-text-muted">{unit}</small>
          </strong>
        </div>
      ))}

      <div className="border-t border-white/10 pt-2">
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center text-accent-orange">
            <RebarIcon size={16} strokeWidth={1.8} aria-hidden="true" />
          </span>
          Fer à béton
        </div>
        {rebarRows.map((row) => (
          <p key={row.size} className="my-1.5 grid grid-cols-[1fr_auto_auto] gap-1 pl-8 text-[10px]">
            <span>{row.size}</span>
            <strong className="text-right">{row.count}</strong>
            <small className="text-right text-text-muted">barres</small>
          </p>
        ))}
      </div>

      <div className="mt-2.5 flex justify-between border-t border-white/15 pt-3 text-[10px] text-text-muted">
        <span>Total estimé</span>
        <strong className="text-[13px] text-primary">24 560 000 FCFA</strong>
      </div>
    </aside>
  );
}
