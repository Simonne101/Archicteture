import Link from "next/link";
import {
  ArrowRight,
  UploadCloud,
  ScanSearch,
  ClipboardCheck,
  FileBarChart,
  Layers,
  Ruler,
  ShieldCheck,
  Gauge,
  FileStack,
  Settings2,
  UserPlus,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroContent } from "@/components/marketing/hero-content";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Reveal } from "@/components/marketing/reveal";
import { MotionCard } from "@/components/marketing/motion-card";

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Importez votre plan",
    description:
      "Déposez votre plan sous forme de PDF ou d'image (JPG, PNG, JPEG). Aucune mise en forme particulière n'est requise.",
  },
  {
    n: "02",
    icon: ScanSearch,
    title: "Analysez votre projet",
    description:
      "Le système identifie les informations exploitables du plan : dimensions, pièces, murs, ouvertures, niveaux.",
  },
  {
    n: "03",
    icon: ClipboardCheck,
    title: "Vérifiez les données",
    description:
      "Vous vérifiez et corrigez les dimensions et paramètres détectés avant le lancement du calcul.",
  },
  {
    n: "04",
    icon: FileBarChart,
    title: "Obtenez votre estimation",
    description:
      "La plateforme génère le métré et l'estimation détaillée des matériaux, prête à être exportée.",
  },
];

const FEATURES = [
  {
    icon: Ruler,
    title: "Lecture des dimensions",
    description:
      "Longueurs, largeurs, surfaces et niveaux extraits automatiquement de vos plans PDF ou image.",
  },
  {
    icon: Gauge,
    title: "Niveaux de confiance",
    description:
      "Chaque donnée détectée est accompagnée d'un score de fiabilité à valider ou corriger.",
  },
  {
    icon: Layers,
    title: "Métré par ouvrage",
    description:
      "Fondations, murs, poteaux, poutres, dalles et toiture : une estimation détaillée poste par poste.",
  },
  {
    icon: Settings2,
    title: "Coefficients paramétrables",
    description:
      "Dosages béton, taux d'ouvertures, diamètres de ferraillage : ajustez les hypothèses de calcul.",
  },
  {
    icon: FileStack,
    title: "Multi-format",
    description:
      "Compatible PDF multi-pages et images JPG, JPEG, PNG, avec zoom et navigation entre pages.",
  },
  {
    icon: ShieldCheck,
    title: "Rapport exploitable",
    description:
      "Exportez un rapport structuré incluant le plan, les données extraites et l'estimation complète.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.06] via-muted/30 to-background">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.06] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="absolute top-[-6rem] left-1/2 -z-10 h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]"
        />
        <div
          aria-hidden
          className="absolute top-24 right-0 -z-10 h-72 w-72 rounded-full bg-[var(--chart-2)]/15 blur-[110px]"
        />
        <div className="mx-auto grid max-w-7xl gap-16 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:pt-20 lg:pb-28">
          <HeroContent />
          <HeroVisual />
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section id="comment-ca-marche" className="scroll-mt-16 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              De votre plan à l&apos;estimation, en 4 étapes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Un parcours simple et guidé, pensé pour les professionnels du
              bâtiment.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                <MotionCard index={i} className="gap-3 p-6">
                  <span className="font-heading text-3xl font-bold text-primary/15">
                    {step.n}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="font-heading font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </MotionCard>
                {i < STEPS.length - 1 && (
                  <div className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 lg:block">
                    <ArrowRight className="size-5 text-border" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Reveal delay={0.15} className="mt-10 flex flex-col items-center gap-3">
            <Button size="lg" asChild className="gap-2">
              <Link href="/dashboard/projects/new">
                Analyser un plan
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              href="/fonctionnement"
              className="text-sm font-medium text-primary hover:underline"
            >
              Voir le parcours complet →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FONCTIONNALITES */}
      <section id="fonctionnalites" className="scroll-mt-16 border-t bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Un véritable outil d&apos;aide au métré
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pensé pour les besoins réels des professionnels du bâtiment, pas
              une simple calculatrice.
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
          <div className="mt-10 flex justify-center">
            <Link
              href="/fonctionnalites"
              className="text-sm font-medium text-primary hover:underline"
            >
              Découvrir toutes les fonctionnalités →
            </Link>
          </div>
        </div>
      </section>

      {/* ACCES */}
      <section id="acces" className="scroll-mt-16 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Comment obtenir un accès
            </h2>
            <p className="mt-4 text-muted-foreground">
              Un accompagnement pensé pour les équipes professionnelles, pas
              une simple inscription en libre-service.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <MotionCard index={0} className="gap-4 p-7">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserPlus className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                Compte individuel
              </h3>
              <p className="text-sm text-muted-foreground">
                Créez votre compte en quelques instants et lancez
                l&apos;analyse de votre premier plan dès aujourd&apos;hui.
              </p>
              <Button asChild className="mt-2 w-fit gap-2">
                <Link href="/signup">
                  Créer un compte
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MotionCard>
            <MotionCard index={1} className="gap-4 p-7">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                Cabinets, bureaux d&apos;études et entreprises
              </h3>
              <p className="text-sm text-muted-foreground">
                Pour les structures avec plusieurs collaborateurs, notre
                équipe prend en charge la configuration de votre espace et la
                création des accès, pour un démarrage accompagné et
                sur-mesure.
              </p>
              <Button variant="outline" asChild className="mt-2 w-fit gap-2">
                <Link href="/login">
                  Vous avez déjà un accès ? Se connecter
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MotionCard>
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
