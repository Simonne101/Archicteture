"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  Boxes,
  Layers3,
  FileBarChart,
  ListTree,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Project } from "@/lib/types";

const chartConfig = {
  volume: { label: "Béton (m³)", color: "var(--chart-1)" },
} satisfies ChartConfig;

const DIAMETRE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ResultsClient({ project }: { project: Project }) {
  const result = project.result!;
  const id = project.id;

  const betonParOuvrage = result.ouvrages
    .map((o) => ({
      ouvrage: o.label,
      volume: o.lines
        .filter((l) => l.unit === "m³" && l.label.toLowerCase().includes("béton"))
        .reduce((s, l) => s + l.quantity, 0),
    }))
    .filter((o) => o.volume > 0);

  const barresChart = result.totals.barres.map((b) => ({
    name: `HA${b.diametre}`,
    value: b.nombre,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">
            Estimation des matériaux
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Résultats du métré pour « {project.name} » — {project.approxSurface} m²,{" "}
            {project.levels} niveau{project.levels > 1 ? "x" : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-1.5">
            <Link href={`/dashboard/projects/${id}/details`}>
              <ListTree className="size-4" />
              Détail du métré
            </Link>
          </Button>
          <Button asChild className="gap-1.5">
            <Link href={`/dashboard/projects/${id}/report`}>
              <FileBarChart className="size-4" />
              Générer le rapport
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Béton total" value={`${formatNumber(result.totals.betonM3)} m³`} icon={Boxes} />
        <StatCard label="Ciment" value={`${formatNumber(result.totals.cimentSacs, 0)} sacs`} icon={Layers3} />
        <StatCard label="Aciers" value={`${formatNumber(result.totals.acierKg, 0)} kg`} icon={ListTree} />
        <StatCard label="Coût estimé" value={formatCurrency(result.coutEstimeFCFA)} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Volume de béton par ouvrage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart data={betonParOuvrage} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="ouvrage"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-base">
              Répartition des barres d&apos;acier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto h-64 w-full max-w-72">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={barresChart}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {barresChart.map((entry, i) => (
                    <Cell key={entry.name} fill={DIAMETRE_COLORS[i % DIAMETRE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
              {barresChart.map((b, i) => (
                <div key={b.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: DIAMETRE_COLORS[i % DIAMETRE_COLORS.length] }}
                  />
                  {b.name} · {b.value} barres
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 py-0">
        <div className="border-b px-5 py-4">
          <h2 className="font-heading font-semibold">Synthèse globale des matériaux</h2>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <TotalRow label="Ciment" value={`${formatNumber(result.totals.cimentSacs, 0)} sacs (50kg)`} />
          <TotalRow
            label="Sable"
            value={`${formatNumber(result.totals.sableM3)} m³`}
            hint={`≈ ${formatNumber(result.totals.sableBrouettes, 0)} brouettes`}
          />
          <TotalRow
            label="Gravier"
            value={`${formatNumber(result.totals.gravierM3)} m³`}
            hint={`≈ ${formatNumber(result.totals.gravierBrouettes, 0)} brouettes`}
          />
          <TotalRow label="Béton" value={`${formatNumber(result.totals.betonM3)} m³`} />
          <TotalRow label="Parpaings" value={`${formatNumber(result.totals.parpaings, 0)} unités`} />
          <TotalRow label="Bois de charpente" value={`${formatNumber(result.totals.boisM3)} m³`} />
          <TotalRow label="Aciers" value={`${formatNumber(result.totals.acierKg, 0)} kg`} />
          <TotalRow
            label="Barres (toutes sections)"
            value={`${formatNumber(result.totals.barres.reduce((s, b) => s + b.nombre, 0), 0)} unités`}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild className="gap-1.5">
          <Link href={`/dashboard/projects/${id}/details`}>
            Voir le détail complet par ouvrage
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading text-lg font-semibold tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
