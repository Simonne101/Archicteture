"use client";

import type { ComponentProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MotionCard({
  index = 0,
  className,
  children,
  ...props
}: { index?: number } & ComponentProps<typeof Card>) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration: 0.55,
        delay: reduced ? 0 : (index % 4) * 0.09,
        ease: EASE,
      }}
      whileHover={reduced ? undefined : { y: -5 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full transition-shadow duration-300 ease-out hover:shadow-lg hover:shadow-primary/5",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}
