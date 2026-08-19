"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/dashboard/file-dropzone";
import { PlanViewer } from "@/components/dashboard/plan-viewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format";
import { Project } from "@/lib/types";
import { replacePlanFileAction, removePlanFileAction } from "@/actions/projects";

export function ImportPlanClient({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  function handleFile(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("planFile", file);
    startTransition(async () => {
      try {
        await replacePlanFileAction(project.id, formData);
        toast.success("Plan importé avec succès");
        router.refresh();
      } catch {
        toast.error("Échec de l'import du plan.");
      } finally {
        setUploading(false);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removePlanFileAction(project.id);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Plan du projet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez ou remplacez le plan architectural du projet «{" "}
          {project.name} ».
        </p>
      </div>

      {!project.planFile ? (
        <Card className="p-6 sm:p-8">
          <FileDropzone onFileAccepted={handleFile} />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {project.planFile.kind === "pdf" ? (
                    <FileText className="size-5" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{project.planFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(project.planFile.size)}
                    {project.planFile.kind === "pdf" &&
                      project.planFile.pageCount &&
                      ` · ${project.planFile.pageCount} page${project.planFile.pageCount > 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  Plan importé
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending || uploading}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={handleRemove}
                  aria-label="Retirer le plan"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>

          <div className="h-[420px]">
            <PlanViewer
              fileUrl={project.planFile.url || null}
              kind={project.planFile.kind}
              fileName={project.planFile.name}
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="gap-2"
              onClick={() => router.push(`/dashboard/projects/${project.id}/analysis`)}
            >
              Aller à l&apos;analyse
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
