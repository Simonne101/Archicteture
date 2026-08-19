import { notFound } from "next/navigation";
import { HardHat } from "lucide-react";
import { getProject } from "@/lib/queries";
import { PlanViewer } from "@/components/dashboard/plan-viewer";
import { PrintButton } from "@/components/dashboard/print-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BUILDING_TYPE_LABELS } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.result || !project.verifiedData) notFound();

  const { result, verifiedData } = project;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="print-hide flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Rapport d&apos;estimation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Document exploitable regroupant le plan, les données et
            l&apos;estimation des matériaux.
          </p>
        </div>
        <PrintButton />
      </div>

      <Card className="gap-8 p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardHat className="size-5" />
            </div>
            <div>
              <p className="font-heading font-semibold">BuildEstimate AI</p>
              <p className="text-xs text-muted-foreground">
                Rapport d&apos;estimation préliminaire des matériaux
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium">{formatDate(result.computedAt)}</p>
            <p className="text-xs text-muted-foreground">Réf. projet #{project.id}</p>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {project.name}
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3 border-b py-1.5 sm:justify-start">
              <dt className="text-muted-foreground">Type de bâtiment</dt>
              <dd className="font-medium">{BUILDING_TYPE_LABELS[project.buildingType]}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b py-1.5 sm:justify-start">
              <dt className="text-muted-foreground">Localisation</dt>
              <dd className="font-medium">{project.location}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b py-1.5 sm:justify-start">
              <dt className="text-muted-foreground">Surface au sol</dt>
              <dd className="font-medium">{formatNumber(verifiedData.surface)} m²</dd>
            </div>
            <div className="flex justify-between gap-3 border-b py-1.5 sm:justify-start">
              <dt className="text-muted-foreground">Niveaux</dt>
              <dd className="font-medium">{verifiedData.niveaux}</dd>
            </div>
          </dl>
        </div>

        <section>
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Plan fourni
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {project.planFile?.name} —{" "}
            {project.planFile?.kind === "pdf" ? "document PDF" : "image"}
          </p>
          <div className="h-96">
            <PlanViewer
              fileUrl={project.planFile?.url || null}
              kind={project.planFile?.kind ?? "image"}
              fileName={project.planFile?.name ?? "plan"}
            />
          </div>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Données extraites et vérifiées
          </h3>
          <Table>
            <TableBody>
              <ReportRow label="Longueur" value={`${formatNumber(verifiedData.longueur)} m`} />
              <ReportRow label="Largeur" value={`${formatNumber(verifiedData.largeur)} m`} />
              <ReportRow label="Hauteur sous plafond" value={`${formatNumber(verifiedData.hauteurSousPlafond)} m`} />
              <ReportRow label="Linéaire de murs" value={`${formatNumber(verifiedData.longueurMurs)} m`} />
              <ReportRow label="Portes / Fenêtres" value={`${verifiedData.nombrePortes} / ${verifiedData.nombreFenetres}`} />
              <ReportRow label="Pièces identifiées" value={`${verifiedData.pieces.length}`} />
            </TableBody>
          </Table>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Résultats — quantités estimées par ouvrage
          </h3>
          <div className="flex flex-col gap-5">
            {result.ouvrages.map((o) => (
              <div key={o.key}>
                <p className="mb-1.5 text-sm font-semibold">{o.label}</p>
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
                        <TableCell>{line.label}</TableCell>
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
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Ferraillage — barres à commander
          </h3>
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
                  <TableCell>HA{b.diametre}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">12 m</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(b.nombre * 12, 0)} m
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="rounded-lg border bg-muted/30 p-5">
          <h3 className="font-heading mb-3 text-sm font-semibold tracking-wide uppercase">
            Estimation financière indicative
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              Coût matériaux estimé (hors main-d&apos;œuvre)
            </span>
            <span className="font-heading text-2xl font-bold">
              {formatCurrency(result.coutEstimeFCFA)}
            </span>
          </div>
        </section>

        <p className="border-t pt-6 text-xs text-muted-foreground">
          Ce rapport présente une estimation préliminaire générée à partir des
          données extraites du plan et vérifiées par l&apos;utilisateur. Les
          quantités indiquées ne remplacent pas une étude technique réalisée
          par un bureau d&apos;études agréé et doivent être confirmées avant
          commande de matériaux.
        </p>
      </Card>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell className="w-1/2 text-muted-foreground">{label}</TableCell>
      <TableCell className="font-medium">{value}</TableCell>
    </TableRow>
  );
}
