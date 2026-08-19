"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BuildingType, BUILDING_TYPE_LABELS } from "@/lib/types";
import { formatFileSize } from "@/lib/format";
import { createProjectAction } from "@/actions/projects";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { FileDropzone } from "@/components/dashboard/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [buildingType, setBuildingType] = useState<BuildingType>("maison");
  const [location, setLocation] = useState("");
  const [levels, setLevels] = useState("1");
  const [surface, setSurface] = useState("");
  const [description, setDescription] = useState("");
  const [planFile, setPlanFileState] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid =
    name.trim().length > 1 &&
    location.trim().length > 1 &&
    Number(levels) >= 1 &&
    Number(surface) > 0 &&
    planFile !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !planFile) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("buildingType", buildingType);
    formData.set("location", location.trim());
    formData.set("levels", levels);
    formData.set("surface", surface);
    formData.set("description", description.trim());
    formData.set("planFile", planFile);

    // createProjectAction redirects to the analysis page on success (which
    // throws internally, by design — Next.js's router intercepts it). Any
    // other failure re-enables the form so the user can retry.
    await createProjectAction(formData);
    setSubmitting(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardTopbar title="Nouveau projet" />
      <div className="flex-1 bg-muted/20 p-4 sm:p-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Annuler et revenir aux projets
          </Link>

          <div className="mt-4 mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Étape 1 sur 5</span>
            <span>Informations générales</span>
          </div>
          <Progress value={100 / 5} className="h-1.5" />

          <Card className="mt-6 gap-6 p-6 sm:p-8">
            <div>
              <h1 className="font-heading text-xl font-semibold">
                Informations générales du projet
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ces informations et le plan importé permettent de calibrer
                l&apos;analyse et les hypothèses de calcul.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                  id="name"
                  placeholder="Ex. Villa Les Cocotiers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="buildingType">Type de bâtiment</Label>
                  <Select
                    value={buildingType}
                    onValueChange={(v) => setBuildingType(v as BuildingType)}
                  >
                    <SelectTrigger id="buildingType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUILDING_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    placeholder="Ville, pays"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="levels">Nombre de niveaux</Label>
                  <Input
                    id="levels"
                    type="number"
                    min={1}
                    max={30}
                    value={levels}
                    onChange={(e) => setLevels(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="surface">Surface approximative (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    min={1}
                    placeholder="Ex. 220"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Contexte du projet, particularités, contraintes…"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Plan architectural</Label>
                {!planFile ? (
                  <FileDropzone
                    onFileAccepted={(file) => {
                      setPlanFileState(file);
                      toast.success("Plan prêt à être importé");
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {planFile.type === "application/pdf" ? (
                          <FileText className="size-4.5" />
                        ) : (
                          <ImageIcon className="size-4.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{planFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(planFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setPlanFileState(null)}
                      aria-label="Retirer le plan"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Formats acceptés : PDF, JPG, JPEG, PNG · 25 Mo maximum
                </p>
              </div>

              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={!isValid || submitting} className="gap-2">
                  Continuer vers l&apos;analyse
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
