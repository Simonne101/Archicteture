import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({ label, id, options, placeholder, className = "", ...props }: SelectProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label htmlFor={selectId} className="flex flex-col gap-1.5 text-sm font-semibold text-text-dark">
      {label}
      <select
        id={selectId}
        className={`h-11 rounded-lg border border-black/10 bg-surface px-3.5 text-sm font-normal outline-none focus:border-primary ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
