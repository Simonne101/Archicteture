import { useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { buttonClasses } from "../../utils/buttonStyles";
import { plansService } from "../../services/plans.service";
import { ApiError } from "../../services/api";
import type { Meta, Plan } from "../../services/types";

export default function PlanUpload({
  projectId,
  meta,
  onUploaded,
}: {
  projectId: string;
  meta: Meta | null;
  onUploaded: (plan: Plan) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Plan | null>(null);

  const acceptedFormats = (meta?.supported_plan_formats ?? ["pdf", "jpg", "jpeg", "png"])
    .map((f) => `.${f}`)
    .join(",");

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const plan = await plansService.upload(projectId, file);
      setUploaded(plan);
      onUploaded(plan);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Le téléversement a échoué. Réessayez.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
      <h3 className="mb-1 font-bold text-text-dark">Importer le plan</h3>
      <p className="mb-5 text-sm text-text-dark/60">
        Formats acceptés : PDF, JPG, PNG.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {uploaded ? (
        <div className="flex items-center gap-3 rounded-lg border border-accent-green/30 bg-accent-green/10 px-4 py-3 text-sm text-text-dark">
          <FileText size={18} className="text-accent-green" aria-hidden="true" />
          <span>
            <strong>{uploaded.original_filename}</strong> reçu avec succès.
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-black/15 px-6 py-12 text-center transition hover:border-primary/40 disabled:opacity-60"
        >
          <UploadCloud size={32} strokeWidth={1.6} className="text-text-dark/40" aria-hidden="true" />
          <span className="text-sm font-semibold text-text-dark">
            {isUploading ? "Envoi en cours..." : "Cliquez pour choisir un fichier"}
          </span>
          <span className="text-xs text-text-dark/50">ou glissez-déposez ici</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {uploaded && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={buttonClasses("outline", "mt-4 h-10 border-black/10 px-4 text-text-dark")}
        >
          Remplacer le fichier
        </button>
      )}
    </div>
  );
}
