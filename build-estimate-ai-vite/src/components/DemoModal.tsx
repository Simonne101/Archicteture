import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Home, Building2, Building, Layers, ArrowRight } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

const demos = [
  {
    slug: "villa-plain-pied",
    icon: Home,
    title: "Villa plain-pied",
    description: "Plan simple avec estimation des matériaux.",
  },
  {
    slug: "villa-r1",
    icon: Building2,
    title: "Villa R+1",
    description: "Projet résidentiel avec plusieurs niveaux.",
  },
  {
    slug: "batiment-professionnel",
    icon: Building,
    title: "Bâtiment professionnel",
    description: "Plan plus complexe avec plusieurs espaces.",
  },
  {
    slug: "projet-complet",
    icon: Layers,
    title: "Projet complet",
    description: "Démonstration complète du workflow.",
  },
];

export default function DemoModal({ open, onClose }: DemoModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function openDemo(slug: string) {
    onClose();
    navigate(`/demo/${slug}`);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-bg-dark-2 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="demo-modal-title" className="text-lg font-bold">
              Choisissez une démonstration
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Données précalculées — aucune attente, aucun compte requis.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fermer la démonstration"
            onClick={onClose}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {demos.map((demo) => (
            <button
              key={demo.slug}
              type="button"
              onClick={() => openDemo(demo.slug)}
              className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-primary/40 hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary/15 text-primary">
                <demo.icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-white">{demo.title}</span>
                <span className="block text-xs text-text-muted">{demo.description}</span>
              </span>
              <ArrowRight
                size={16}
                className="flex-none text-white/30 transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
