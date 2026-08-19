import Link from "next/link";
import { HardHat } from "lucide-react";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/fonctionnalites", label: "Fonctionnalités" },
      { href: "/fonctionnement", label: "Comment ça marche" },
      { href: "/#acces", label: "Accès" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/login", label: "Connexion" },
      { href: "/signup", label: "Inscription" },
      { href: "/dashboard", label: "Tableau de bord" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: "#", label: "Documentation" },
      { href: "#", label: "Centre d'aide" },
      { href: "#", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HardHat className="size-4.5" />
              </div>
              <span className="font-heading text-base font-semibold">
                BuildEstimate AI
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Transformez vos plans architecturaux en estimation préliminaire
              des matériaux nécessaires à votre construction.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-semibold">
                {col.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BuildEstimate AI. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Les estimations générées sont préliminaires et ne remplacent pas
            une étude technique réalisée par un bureau d&apos;études agréé.
          </p>
        </div>
      </div>
    </footer>
  );
}
