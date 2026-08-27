export type ButtonVariant = "primary" | "outline";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full px-6 h-12 font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35",
  outline:
    "border border-white/25 text-white bg-transparent hover:bg-white/5",
};

export function buttonClasses(variant: ButtonVariant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}
