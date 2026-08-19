"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileKind } from "@/lib/types";

export function PlanViewer({
  fileUrl,
  kind,
  fileName,
}: {
  fileUrl: string | null;
  kind: FileKind;
  fileName: string;
}) {
  const [scale, setScale] = useState(1);

  if (!fileUrl) {
    return (
      <div className="flex h-full min-h-80 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-8 text-center">
        <FileWarning className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Aperçu indisponible — le fichier « {fileName} » a été importé lors
          d&apos;une session précédente.
        </p>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className="h-full overflow-hidden rounded-xl border bg-card">
        <iframe
          src={fileUrl}
          title={`Aperçu du plan ${fileName}`}
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setScale((s) => Math.max(0.5, round1(s - 0.2)))}
          aria-label="Zoom arrière"
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setScale((s) => Math.min(2.5, round1(s + 0.2)))}
          aria-label="Zoom avant"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setScale(1)}
          aria-label="Réinitialiser le zoom"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[repeating-linear-gradient(45deg,var(--muted)_0,var(--muted)_1px,transparent_0,transparent_50%)] bg-[length:16px_16px] p-4">
        <img
          src={fileUrl}
          alt={`Aperçu du plan ${fileName}`}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          className="max-w-none rounded-md border bg-white shadow-sm transition-transform"
        />
      </div>
    </div>
  );
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}
