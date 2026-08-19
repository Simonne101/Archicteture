import { CheckCircle2, Sparkles } from "lucide-react";

const POINTS = [
  "Import de plans PDF ou image",
  "Métré détaillé par ouvrage",
  "Rapport exploitable en un clic",
];

export function AuthAside() {
  return (
    <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12 lg:text-primary-foreground">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
      <div className="relative">
        <p className="text-sm font-medium text-primary-foreground/70">
          Plateforme professionnelle
        </p>
        <h2 className="mt-3 max-w-md font-heading text-3xl font-bold tracking-tight text-balance">
          L&apos;estimation de matériaux, du plan à la mise en chantier.
        </h2>
        <ul className="mt-8 flex flex-col gap-3">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm text-primary-foreground/90">
              <CheckCircle2 className="size-4.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex items-center gap-2.5 border-t border-primary-foreground/15 pt-8 text-sm text-primary-foreground/80">
        <Sparkles className="size-4.5 shrink-0" />
        Propulsé par l&apos;IA Gemini (Google)
      </div>
    </div>
  );
}
