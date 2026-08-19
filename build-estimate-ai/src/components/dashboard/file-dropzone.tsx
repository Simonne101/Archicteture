"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

const MAX_SIZE = 25 * 1024 * 1024;

export function FileDropzone({
  onFileAccepted,
}: {
  onFileAccepted: (file: File) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const rejection = rejections[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError("Le fichier dépasse la taille maximale de 25 Mo.");
        } else {
          setError("Format non pris en charge. Utilisez PDF, JPG, JPEG ou PNG.");
        }
        return;
      }
      setError(null);
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} aria-label="Déposer un plan architectural" />
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </div>
        <div>
          <p className="font-medium">
            {isDragActive ? "Déposez le fichier ici" : "Déposez votre plan ici"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ou{" "}
            <span className="font-medium text-primary underline underline-offset-2">
              sélectionnez un fichier
            </span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Formats acceptés : PDF, JPG, JPEG, PNG · 25 Mo maximum
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <FileWarning className="size-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
