import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileBarChart } from "lucide-react";
import { getProject } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/format";

export default async function DetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.result) notFound();

  const { result } = project;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">
            Détail du métré
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quantités détaillées par poste d&apos;ouvrage pour « {project.name} ».
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href={`/dashboard/projects/${id}/report`}>
            <FileBarChart className="size-4" />
            Générer le rapport
          </Link>
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <Tabs defaultValue={result.ouvrages[0]?.key} className="gap-0">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-0 rounded-none border-b bg-transparent p-0">
            {result.ouvrages.map((o) => (
              <TabsTrigger
                key={o.key}
                value={o.key}
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {o.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {result.ouvrages.map((o) => (
            <TabsContent key={o.key} value={o.key} className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élément</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Remarque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {o.lines.map((line) => (
                    <TableRow key={line.label}>
                      <TableCell className="font-medium">{line.label}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(line.quantity)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{line.unit}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {line.note ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="border-b px-5 py-4">
          <h2 className="font-heading font-semibold">
            Ferraillage — barres à commander
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Répartition par diamètre pour un total de {formatNumber(result.totals.acierKg, 0)} kg d&apos;acier.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Diamètre</TableHead>
              <TableHead className="text-right">Nombre de barres</TableHead>
              <TableHead>Longueur unitaire</TableHead>
              <TableHead className="text-right">Longueur totale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.totals.barres.map((b) => (
              <TableRow key={b.diametre}>
                <TableCell className="font-medium">HA{b.diametre}</TableCell>
                <TableCell className="text-right tabular-nums">{b.nombre}</TableCell>
                <TableCell className="text-muted-foreground">12 m</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatNumber(b.nombre * 12, 0)} m
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" asChild className="gap-1.5">
          <Link href={`/dashboard/projects/${id}/results`}>
            Retour à la synthèse
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
