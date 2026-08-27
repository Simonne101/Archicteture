const styles: Record<string, string> = {
  draft: "bg-black/5 text-text-dark/70",
  active: "bg-accent-blue/10 text-accent-blue",
  completed: "bg-accent-green/10 text-accent-green",
  archived: "bg-black/5 text-text-dark/50",
  ready: "bg-black/5 text-text-dark/70",
  processing: "bg-accent-orange/10 text-accent-orange",
  analyzed: "bg-accent-green/10 text-accent-green",
  needs_review: "bg-accent-orange/10 text-accent-orange",
  failed: "bg-red-100 text-red-700",
  queued: "bg-black/5 text-text-dark/70",
};

const labels: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  archived: "Archivé",
  ready: "Prêt",
  processing: "En cours",
  analyzed: "Analysé",
  needs_review: "À vérifier",
  failed: "Échoué",
  queued: "En attente",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-black/5 text-text-dark/70"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
