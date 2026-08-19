"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CountUp } from "./count-up";

const EASE = [0.16, 1, 0.3, 1] as const;

const MATERIALS = [
  { label: "Ciment", value: 184, decimals: 0, thousands: false, unit: "sacs", tone: "var(--chart-1)" },
  { label: "Sable", value: 22.4, decimals: 1, thousands: false, unit: "m³", tone: "var(--chart-2)" },
  { label: "Gravier", value: 38.1, decimals: 1, thousands: false, unit: "m³", tone: "var(--chart-3)" },
  { label: "Parpaings", value: 3240, decimals: 0, thousands: true, unit: "u.", tone: "var(--chart-4)" },
  { label: "Béton", value: 31.6, decimals: 1, thousands: false, unit: "m³", tone: "var(--chart-5)" },
  { label: "Aciers", value: 1480, decimals: 0, thousands: true, unit: "kg", tone: "var(--chart-1)" },
] as const;

const CONFIDENCE = 0.87;
const LIST_START = 0.95;
const LIST_STEP = 0.09;

export function HeroVisual() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: reduced ? 0 : 0.35, ease: EASE }}
      className="relative"
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-10 -z-10 size-72 rounded-full bg-primary/20 blur-[90px]"
      />
      <CornerBrackets />

      <Card className="gap-0 overflow-hidden border-border/70 py-0 shadow-2xl shadow-primary/10 ring-1 ring-border/60">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-muted-foreground">
            Plan_Villa_220m2.pdf
          </span>
          <Badge className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            <motion.span
              className="size-1.5 rounded-full bg-emerald-500"
              animate={reduced ? undefined : { opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            Analysé
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2">
          <div className="relative flex items-center justify-center overflow-hidden border-b bg-white p-6 sm:border-r sm:border-b-0">
            <PlanSvg />
            {!reduced && <ScanBeam />}
          </div>

          <div className="flex flex-col justify-center gap-2.5 p-5">
            {MATERIALS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={reduced ? false : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: reduced ? 0 : LIST_START + i * LIST_STEP,
                  ease: EASE,
                }}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: m.tone }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {m.label}
                  </span>
                </div>
                <span className="font-mono text-sm font-medium tabular-nums">
                  <CountUp
                    value={m.value}
                    decimals={m.decimals}
                    thousands={m.thousands}
                    delay={LIST_START + i * LIST_STEP}
                  />{" "}
                  {m.unit}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: -14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 1.5, ease: EASE }}
        className="absolute -top-5 -right-5 hidden sm:block"
      >
        <FloatWrapper reduced={!!reduced} delay={2.1}>
          <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
            <ConfidenceRing value={CONFIDENCE} reduced={!!reduced} />
            <div>
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Confiance globale
              </p>
              <p className="font-heading text-lg font-semibold text-emerald-600">
                87%
              </p>
            </div>
          </div>
        </FloatWrapper>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 14, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: reduced ? 0 : 1.65, ease: EASE }}
        className="absolute -bottom-4 -left-4 hidden sm:block"
      >
        <FloatWrapper reduced={!!reduced} delay={2.3} distance={5}>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 text-xs font-medium text-muted-foreground shadow-lg">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Layers className="size-3" />
            </span>
            4 niveaux · 12 pièces détectées
          </div>
        </FloatWrapper>
      </motion.div>
    </motion.div>
  );
}

function FloatWrapper({
  children,
  reduced,
  delay = 0,
  distance = 6,
}: {
  children: ReactNode;
  reduced: boolean;
  delay?: number;
  distance?: number;
}) {
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      animate={{ y: [0, -distance, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function ScanBeam() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-6 h-14 rounded-full bg-gradient-to-b from-primary/0 via-primary/25 to-primary/0 blur-sm"
      initial={{ top: "-20%" }}
      animate={{ top: ["-20%", "110%"] }}
      transition={{
        duration: 2.6,
        repeat: Infinity,
        repeatDelay: 0.7,
        ease: "easeInOut",
      }}
    />
  );
}

function ConfidenceRing({
  value,
  reduced,
}: {
  value: number;
  reduced: boolean;
}) {
  const size = 40;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--chart-5)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: reduced ? c * (1 - value) : c }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 1.2, delay: reduced ? 0 : 1.7, ease: EASE }}
      />
    </svg>
  );
}

function CornerBrackets() {
  const base = "absolute size-6 border-primary/25";
  return (
    <div aria-hidden className="pointer-events-none absolute -inset-3 hidden sm:block">
      <span className={`${base} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${base} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}

function PlanSvg() {
  return (
    <svg
      viewBox="0 0 200 160"
      className="h-auto w-full max-w-52 text-slate-400"
      fill="none"
      aria-hidden
    >
      <rect x="10" y="10" width="180" height="140" stroke="currentColor" strokeWidth="2" />
      <line x1="10" y1="80" x2="110" y2="80" stroke="currentColor" strokeWidth="1.5" />
      <line x1="110" y1="10" x2="110" y2="150" stroke="currentColor" strokeWidth="1.5" />
      <line x1="150" y1="80" x2="150" y2="150" stroke="currentColor" strokeWidth="1.5" />
      <rect x="40" y="6" width="24" height="8" fill="white" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="100" width="8" height="24" fill="white" stroke="currentColor" strokeWidth="1.5" />
      <text x="16" y="24" fontSize="8" fill="currentColor">Séjour</text>
      <text x="16" y="100" fontSize="8" fill="currentColor">Ch. 1</text>
      <text x="120" y="24" fontSize="8" fill="currentColor">Cuisine</text>
      <text x="120" y="100" fontSize="8" fill="currentColor">Ch. 2</text>
      <text x="160" y="100" fontSize="7" fill="currentColor">SdB</text>
    </svg>
  );
}
