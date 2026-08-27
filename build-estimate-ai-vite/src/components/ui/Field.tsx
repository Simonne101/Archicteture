import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, id, className = "", ...props }: FieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 text-sm font-semibold text-text-dark">
      {label}
      <input
        id={inputId}
        className={`h-11 rounded-lg border border-black/10 px-3.5 text-sm font-normal outline-none focus:border-primary ${className}`}
        {...props}
      />
    </label>
  );
}
