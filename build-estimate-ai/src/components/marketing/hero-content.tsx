"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function HeroContent() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={reduced ? undefined : container}
      initial={reduced ? false : "hidden"}
      animate="show"
    >
      <motion.div variants={reduced ? undefined : item}>
        <Badge
          variant="outline"
          className="mb-5 gap-1.5 border-primary/30 bg-primary/5 py-1 text-primary"
        >
          <Gauge className="size-3.5" />
          Outil professionnel d&apos;aide au métré
        </Badge>
      </motion.div>

      <motion.h1
        variants={reduced ? undefined : item}
        className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
      >
        Transformez vos plans en estimations de matériaux.
      </motion.h1>

      <motion.p
        variants={reduced ? undefined : item}
        className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty"
      >
        Analysez vos plans architecturaux et obtenez une estimation
        préliminaire des matériaux nécessaires à votre projet de
        construction, des fondations à la toiture.
      </motion.p>

      <motion.div
        variants={reduced ? undefined : item}
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <motion.div
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
        >
          <Button size="lg" asChild className="w-full gap-2 sm:w-auto">
            <Link href="/dashboard/projects/new">
              Analyser un plan
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
        <motion.div
          whileHover={reduced ? undefined : { scale: 1.03 }}
          whileTap={reduced ? undefined : { scale: 0.97 }}
        >
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="#comment-ca-marche">Voir comment ça fonctionne</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        variants={reduced ? undefined : item}
        className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
      >
        <span className="font-medium text-foreground">
          Conçu pour les professionnels du bâtiment
        </span>
        <span>Architectes</span>
        <span>Ingénieurs</span>
        <span>Conducteurs de travaux</span>
        <span>Entreprises de construction</span>
      </motion.div>
    </motion.div>
  );
}
