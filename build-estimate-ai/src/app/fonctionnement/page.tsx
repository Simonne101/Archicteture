import Link from "next/link";
import {
  ArrowRight,
  FolderPlus,
  ScanSearch,
  ClipboardCheck,
  Settings2,
  FileBarChart,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal } from "@/components/marketing/reveal";
import { MotionCard } from "@/components/marketing/motion-card";

const STAGES = [
  {
    n: "01",
    icon: FolderPlus,
    title: "Nouveau projet",
    description:
      "Renseignez les informations de base de votre projet (nom, type de construction, localisation) puis importez votre plan sous forme de PDF ou d'image.",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "Analyse par IA",
    description:
      "Le plan est analysé automatiquement : pièces, murs, ouvertures, dimensions et niveaux sont identifiés à partir du document importé.",
  },
  {
    n: "03",
    icon: ClipboardCheck,
    title: "Vérification des données",
    description:
      "Les données extraites vous sont présentées avec leur niveau de confiance. Vous validez ou corrigez les valeurs avant de poursuivre.",
  },
  {
    n: "04",
    icon: Settings2,
    title: "Paramètres techniques",
    description:
      "Ajustez les hypothèses de calcul selon vos pratiques : dosages béton, taux d'ouvertures, diamètres de ferraillage et autres coefficients.",
  },
  {
    n: "05",
    icon: FileBarChart,
    title: "Résultats et rapport",
    description:
      "Consultez l'estimation détaillée des matériaux et des coûts par ouvrage, puis exportez un rapport complet prêt à être partagé.",
  },
];

export default function FonctionnementPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/40 to-background">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        />
        <Reveal className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <Badge
            variant="outline"
            className="mb-5 gap-1.5 border-primary/30 bg-primary/5 py-1 text-primary"
          >
            <Gauge className="size-3.5" />
            Comment ça marche
          </Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            De votre plan à l&apos;estimation, étape par étape
          </h1>
          <p className="mt-5 text-lg text-muted-foreground text-pretty">
            Voici le parcours exact que vous suivez sur BuildEstimate AI,
            depuis la création du projet jusqu&apos;au rapport final.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild className="gap-2">
              <Link href="/dashboard/projects/new">
                Analyser un plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* TIMELINE */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col gap-10">
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-[27px] w-px bg-border sm:left-[31px]"
            />
            {STAGES.map((stage, i) => (
              <div key={stage.n} className="relative flex gap-5 sm:gap-6">
                <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-sm sm:size-16">
                  <stage.icon className="size-6" />
                </div>
                <MotionCard index={i} className="flex-1 gap-2 p-6">
                  <span className="font-heading text-sm font-semibold tracking-wide text-primary/60">
                    ÉTAPE {stage.n}
                  </span>
                  <h2 className="font-heading text-xl font-semibold">
                    {stage.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stage.description}
                  </p>
                </MotionCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden border-t bg-primary py-16 text-primary-foreground sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--primary-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary-foreground)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.06] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
        />
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Prêt à estimer votre prochain projet ?
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Importez votre premier plan et obtenez une estimation préliminaire
            en quelques minutes.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link href="/dashboard/projects/new">
              Créer un projet
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
