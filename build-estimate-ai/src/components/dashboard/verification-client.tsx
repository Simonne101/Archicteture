"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { DetectedRoom, Project, VerifiedData } from "@/lib/types";
import { ConfidenceBadge } from "@/components/dashboard/confidence-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { confirmVerificationAction } from "@/actions/projects";

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function VerificationClient({ project }: { project: Project }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const detected = project.detectedData!;
  const [form, setForm] = useState<VerifiedData>(
    project.verifiedData ?? {
      longueur: detected.longueur.value,
      largeur: detected.largeur.value,
      surface: detected.surface.value,
      niveaux: detected.niveaux.value,
      hauteurSousPlafond: detected.hauteurSousPlafond.value,
      longueurMurs: detected.longueurMurs.value,
      nombrePortes: detected.nombrePortes.value,
      nombreFenetres: detected.nombreFenetres.value,
      pieces: detected.pieces,
    }
  );

  function setField<K extends keyof VerifiedData>(key: K, value: VerifiedData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateRoom(roomId: string, patch: Partial<DetectedRoom>) {
    setForm((f) => ({
      ...f,
      pieces: f.pieces.map((p) => (p.id === roomId ? { ...p, ...patch } : p)),
    }));
  }

  function removeRoom(roomId: string) {
    setForm((f) => ({ ...f, pieces: f.pieces.filter((p) => p.id !== roomId) }));
  }

  function addRoom() {
    setForm((f) => ({
      ...f,
      pieces: [...f.pieces, { id: makeId(), label: "Nouvelle pièce", surface: 10, score: 1 }],
    }));
  }

  const lowConfidenceCount =
    [
      detected.longueur,
      detected.largeur,
      detected.hauteurSousPlafond,
      detected.longueurMurs,
      detected.nombrePortes,
      detected.nombreFenetres,
    ].filter((f) => f.score < 0.6).length + detected.pieces.filter((p) => p.score < 0.6).length;

  function handleConfirm() {
    startTransition(async () => {
      await confirmVerificationAction(project.id, form);
      router.push(`/dashboard/projects/${project.id}/settings`);
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">
          Vérification des données
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Corrigez si nécessaire les valeurs détectées avant de lancer le
          calcul des matériaux.
        </p>
      </div>

      {lowConfidenceCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600">
          <AlertTriangle className="size-4" />
          <AlertTitle>Vérification recommandée</AlertTitle>
          <AlertDescription className="text-amber-700">
            {lowConfidenceCount} donnée{lowConfidenceCount > 1 ? "s" : ""} présente
            {lowConfidenceCount > 1 ? "nt" : ""} un niveau de confiance faible. Merci de
            les contrôler avant de continuer.
          </AlertDescription>
        </Alert>
      )}

      <Card className="gap-5 p-5 sm:p-6">
        <h2 className="font-heading font-semibold">Dimensions générales</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldInput
            label="Longueur (m)"
            value={form.longueur}
            score={detected.longueur.score}
            onChange={(v) => setField("longueur", v)}
          />
          <FieldInput
            label="Largeur (m)"
            value={form.largeur}
            score={detected.largeur.score}
            onChange={(v) => setField("largeur", v)}
          />
          <FieldInput
            label="Surface au sol (m²)"
            value={form.surface}
            score={detected.surface.score}
            onChange={(v) => setField("surface", v)}
          />
          <FieldInput
            label="Nombre de niveaux"
            value={form.niveaux}
            score={detected.niveaux.score}
            onChange={(v) => setField("niveaux", v)}
          />
          <FieldInput
            label="Hauteur sous plafond (m)"
            value={form.hauteurSousPlafond}
            score={detected.hauteurSousPlafond.score}
            onChange={(v) => setField("hauteurSousPlafond", v)}
            step={0.05}
          />
          <FieldInput
            label="Linéaire de murs (m)"
            value={form.longueurMurs}
            score={detected.longueurMurs.score}
            onChange={(v) => setField("longueurMurs", v)}
          />
          <FieldInput
            label="Nombre de portes"
            value={form.nombrePortes}
            score={detected.nombrePortes.score}
            onChange={(v) => setField("nombrePortes", v)}
          />
          <FieldInput
            label="Nombre de fenêtres"
            value={form.nombreFenetres}
            score={detected.nombreFenetres.score}
            onChange={(v) => setField("nombreFenetres", v)}
          />
        </div>
      </Card>

      <Card className="gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold">
            Pièces identifiées ({form.pieces.length})
          </h2>
          <Button variant="outline" size="sm" onClick={addRoom} className="gap-1.5">
            <Plus className="size-3.5" />
            Ajouter une pièce
          </Button>
        </div>
        <div className="flex flex-col gap-2.5">
          {form.pieces.map((room) => (
            <div
              key={room.id}
              className="flex items-center gap-2.5 rounded-lg border p-2.5"
            >
              <Input
                value={room.label}
                onChange={(e) => updateRoom(room.id, { label: e.target.value })}
                className="h-9 flex-1"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={room.surface}
                  onChange={(e) =>
                    updateRoom(room.id, { surface: Number(e.target.value) })
                  }
                  className="h-9 w-24"
                />
                <span className="text-xs text-muted-foreground">m²</span>
              </div>
              <ConfidenceBadge score={room.score} />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRoom(room.id)}
                aria-label="Supprimer la pièce"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleConfirm} disabled={isPending} className="gap-2">
          <CheckCircle2 className="size-4" />
          {isPending ? "Enregistrement…" : "Confirmer et continuer"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  score,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  score: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  const inputId = `field-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId}>{label}</Label>
        <ConfidenceBadge score={score} />
      </div>
      <Input
        id={inputId}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
