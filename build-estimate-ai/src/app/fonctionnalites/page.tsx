import Link from "next/link";
import {
  ArrowRight,
  Ruler,
  Gauge,
  Layers,
  Settings2,
  FileStack,
  ShieldCheck,
  UploadCloud,
  ScanSearch,
  ClipboardCheck,
  FileBarChart,
  Building2,
  HardHat,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal } from "@/components/marketing/reveal";
import { MotionCard } from "@/components/marketing/motion-card";

const FEATURES = [
  {
    icon: Ruler,
    title: "Lecture des dimensions",
    description:
      "Longueurs, largeurs, surfaces habitables et niveaux sont extraits automatiquement de vos plans PDF ou image, sans ressaisie manuelle.",
  },
  {
    icon: Gauge,
    title: "Niveaux de confiance",
    description:
      "Chaque donnée détectée est accompagnée d'un score de fiabilité. Vous savez immédiatement ce qui mérite une vérification avant le calcul.",
  },
  {
    icon: Layers,
    title: "Métré par ouvrage",
    description:
      "Fondations, murs, poteaux, poutres, dalles, toiture : chaque poste est estimé séparément pour une lecture claire du projet.",
  },
  {
    icon: Settings2,
    title: "Coefficients paramétrables",
    description:
      "Dosages béton, taux d'ouvertures, diamètres de ferraillage : ajustez les hypothèses de calcul selon vos pratiques et normes locales.",
  },
  {
    icon: FileStack,
    title: "Multi-format",
    description:
      "Compatible PDF multi-pages et images JPG, JPEG, PNG, avec zoom et navigation entre pages pour les plans les plus complexes.",
  },
  {
    icon: ShieldCheck,
    title: "Rapport exploitable",
    description:
      "Exportez un rapport structuré incluant le plan, les données extraites et l'estimation complète, prêt à être partagé.",
  },
];

const PIPELINE = [
  {
    icon: UploadCloud,
    title: "Import du plan",
    description:
      "Déposez votre plan architectural. Aucune mise en forme particulière n'est requise.",
  },
  {
    icon: ScanSearch,
    title: "Analyse par IA",
    description:
      "Le système identifie pièces, murs, ouvertures, cotes et niveaux directement depuis le document.",
  },
  {
    icon: ClipboardCheck,
    title: "Vérification",
    description:
      "Vous validez ou corrigez les données extraites avant le lancement du calcul.",
  },
  {
    icon: FileBarChart,
    title: "Estimation détaillée",
    description:
      "La plateforme génère le métré et le coût estimé, poste par poste.",
  },
];

const OUTPUTS = [
  "Ciment (sacs)",
  "Sable (m³)",
  "Gravier (m³)",
  "Béton (m³)",
  "Parpaings / agglos (unités)",
  "Ferraillage et barres d'acier (diamètres, kg)",
  "Bois de charpente",
  "Coût estimé global et par ouvrage",
];

const AUDIENCE = [
  {
    icon: Building2,
    title: "Architectes",
    description:
      "Chiffrez rapidement une esquisse ou un permis de construire pour éclairer vos clients dès les premières phases.",
  },
  {
    icon: HardHat,
    title: "Ingénieurs & bureaux d'études",
    description:
      "Obtenez une base de calcul structurée à affiner selon vos propres méthodes et normes de dimensionnement.",
  },
  {
    icon: Wrench,
    title: "Professionnels du BTP",
    description:
      "Entrepreneurs, conducteurs de travaux et promoteurs : préparez vos besoins en matériaux avant la mise en chantier.",
  },
];

export default function FonctionnalitesPage() {
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
            Fonctionnalités
          </Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Un véritable outil d&apos;aide au métré
          </h1>
          <p className="mt-5 text-lg text-muted-foreground text-pretty">
            De l&apos;import du plan au rapport final, BuildEstimate AI
            couvre l&apos;ensemble du processus d&apos;estimation des
            matériaux de construction, pensé pour les besoins réels des
            professionnels du bâtiment.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link href="/dashboard/projects/new">
                Analyser un plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/fonctionnement">Voir le parcours en détail</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* PIPELINE */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Du plan à l&apos;estimation
            </h2>
            <p className="mt-4 text-muted-foreground">
              Un parcours continu, de l&apos;import du document à un rapport
              exploitable.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <div key={step.title} className="relative">
                <MotionCard index={i} className="h-full gap-3 p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="font-heading font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </MotionCard>
                {i < PIPELINE.length - 1 && (
                  <div className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="size-5 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="border-t bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ce que la plateforme vous apporte
            </h2>
            <p className="mt-4 text-muted-foreground">
              Bien plus qu&apos;une calculatrice : un outil pensé pour la
              rigueur du métré.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <MotionCard key={f.title} index={i} className="gap-3 p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* OUTPUTS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                Une estimation détaillée, matériau par matériau
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Le rapport final présente les quantités estimées pour chaque
                matériau nécessaire au chantier, avec le coût associé,
                directement exploitable pour préparer vos approvisionnements.
              </p>
              <Button size="lg" asChild className="mt-8 gap-2">
                <Link href="/dashboard/projects/new">
                  Analyser un plan
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
            <Reveal delay={0.15}>
              <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-xl shadow-primary/5">
                <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Estimation des matériaux
                  </span>
                </div>
                <ul className="flex flex-col divide-y">
                  {OUTPUTS.map((o) => (
                    <li
                      key={o}
                      className="flex items-center gap-2.5 px-5 py-3 text-sm"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{o}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="border-t bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Conçu pour les professionnels du bâtiment
            </h2>
            <p className="mt-4 text-muted-foreground">
              Architectes, ingénieurs et acteurs du BTP : un outil qui
              s&apos;adapte à votre métier.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {AUDIENCE.map((a, i) => (
              <MotionCard key={a.title} index={i} className="gap-3 p-6 text-center">
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="size-5" />
                </div>
                <h3 className="font-heading font-semibold">{a.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {a.description}
                </p>
              </MotionCard>
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
