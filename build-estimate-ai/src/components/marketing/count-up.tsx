"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

function format(value: number, decimals: number, thousands: boolean) {
  const fixed = value.toFixed(decimals);
  if (!thousands) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart ? `${grouped}.${decPart}` : grouped;
}

export function CountUp({
  value,
  decimals = 0,
  thousands = false,
  delay = 0,
  className,
}: {
  value: number;
  decimals?: number;
  thousands?: boolean;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      el.textContent = format(value, decimals, thousands);
      return;
    }

    el.textContent = format(0, decimals, thousands);
    const controls = animate(0, value, {
      duration: 1.3,
      delay,
      ease: EASE,
      onUpdate: (latest) => {
        el.textContent = format(latest, decimals, thousands);
      },
    });

    return () => controls.stop();
  }, [value, decimals, thousands, delay, reduced]);

  return (
    <span ref={ref} className={className}>
      {format(reduced ? value : 0, decimals, thousands)}
    </span>
  );
}
