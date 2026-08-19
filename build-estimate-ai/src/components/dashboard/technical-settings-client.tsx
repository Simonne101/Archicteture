"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Calculator, RotateCcw } from "lucide-react";
import {
  DEFAULT_TECHNICAL_PARAMS,
  Project,
  TechnicalParams,
  TYPE_CHARPENTE_LABELS,
  TYPE_COUVERTURE_LABELS,
  TYPE_FONDATION_LABELS,
  TypeCharpente,
  TypeCouverture,
  TypeFondation,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeResultAction } from "@/actions/projects";

const DIAMETRE_OPTIONS = [6, 8, 10, 12, 14, 16, 20];

export function TechnicalSettingsClient({ project }: { project: Project }) {
  const [form, setForm] = useState<TechnicalParams>(project.technicalParams);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof TechnicalParams>(key: K, value: TechnicalParams[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDiametre(d: number) {
    setForm((f) => {
      const has = f.diametresFerraillage.includes(d);
      const diametresFerraillage = has
        ? f.diametresFerraillage.filter((x) => x !== d)
        : [...f.diametresFerraillage, d].sort((a, b) => a - b);
      return { ...f, diametresFerraillage };
    });
  }

  function handleCompute() {
    startTransition(async () => {
      await computeResultAction(project.id, form);
    });
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">
            Paramètres techniques
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajustez les hypothèses de calcul selon les pratiques de votre
            projet.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => setForm({ ...DEFAULT_TECHNICAL_PARAMS })}
        >
          <RotateCcw className="size-3.5" />
          Réinitialiser
        </Button>
      </div>

      <Card className="gap-5 p-5 sm:p-6">
        <h2 className="font-heading font-semibold">Structure</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Type de fondation</Label>
            <Select
              value={form.typeFondation}
              onValueChange={(v) => set("typeFondation", v as TypeFondation)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_FONDATION_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type de charpente / toiture</Label>
            <Select
              value={form.typeCharpente}
              onValueChange={(v) => set("typeCharpente", v as TypeCharpente)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_CHARPENTE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.typeCharpente !== "dalle_beton" && (
            <div className="flex flex-col gap-1.5">
              <Label>Type de couverture</Label>
              <Select
                value={form.typeCouverture}
                onValueChange={(v) => set("typeCouverture", v as TypeCouverture)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tole_bac_acier">
                    {TYPE_COUVERTURE_LABELS.tole_bac_acier}
                  </SelectItem>
                  <SelectItem value="tuile">{TYPE_COUVERTURE_LABELS.tuile}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="epaisseurMurs">Épaisseur des murs (m)</Label>
            <Input
              id="epaisseurMurs"
              type="number"
              step={0.01}
              value={form.epaisseurMurs}
              onChange={(e) => set("epaisseurMurs", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="epaisseurDalle">Épaisseur des dalles (m)</Label>
            <Input
              id="epaisseurDalle"
              type="number"
              step={0.01}
              value={form.epaisseurDalle}
              onChange={(e) => set("epaisseurDalle", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tauxOuvertures">
              Taux d&apos;ouvertures (portes/fenêtres)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="tauxOuvertures"
                type="number"
                min={0}
                max={40}
                value={Math.round(form.tauxOuvertures * 100)}
                onChange={(e) =>
                  set("tauxOuvertures", Number(e.target.value) / 100)
                }
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h2 className="font-heading font-semibold">Béton & ferraillage</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dosage">Dosage ciment du béton (kg/m³)</Label>
            <Input
              id="dosage"
              type="number"
              step={10}
              value={form.dosageCimentBeton}
              onChange={(e) => set("dosageCimentBeton", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Diamètres de ferraillage utilisés</Label>
          <div className="flex flex-wrap gap-3">
            {DIAMETRE_OPTIONS.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox
                  checked={form.diametresFerraillage.includes(d)}
                  onCheckedChange={() => toggleDiametre(d)}
                />
                HA{d}
              </label>
            ))}
          </div>
        </div>
      </Card>

      <Card className="gap-5 p-5 sm:p-6">
        <h2 className="font-heading font-semibold">
          Coûts unitaires (estimation financière)
        </h2>
        <p className="text-xs text-muted-foreground">
          Pré-remplis avec les prix de référence de la plateforme (modifiables
          par l&apos;administrateur). Ajustez-les selon les prix pratiqués sur
          votre chantier.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixCiment">Sac de ciment 50kg (FCFA)</Label>
            <Input
              id="prixCiment"
              type="number"
              value={form.prixCimentSac}
              onChange={(e) => set("prixCimentSac", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixParpaing">Parpaing unitaire (FCFA)</Label>
            <Input
              id="prixParpaing"
              type="number"
              value={form.prixParpaing}
              onChange={(e) => set("prixParpaing", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixFer">Barre d&apos;acier 12m (FCFA)</Label>
            <Input
              id="prixFer"
              type="number"
              value={form.prixFerBarre}
              onChange={(e) => set("prixFerBarre", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixSable">Sable (FCFA / m³)</Label>
            <Input
              id="prixSable"
              type="number"
              value={form.prixSableM3}
              onChange={(e) => set("prixSableM3", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixGravier">Gravier (FCFA / m³)</Label>
            <Input
              id="prixGravier"
              type="number"
              value={form.prixGravierM3}
              onChange={(e) => set("prixGravierM3", Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prixBois">Bois de charpente (FCFA / m³)</Label>
            <Input
              id="prixBois"
              type="number"
              value={form.prixBoisM3}
              onChange={(e) => set("prixBoisM3", Number(e.target.value))}
            />
          </div>
          {form.typeCharpente !== "dalle_beton" && form.typeCouverture === "tole_bac_acier" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prixTole">Feuille de tôle (FCFA)</Label>
              <Input
                id="prixTole"
                type="number"
                value={form.prixToleFeuille}
                onChange={(e) => set("prixToleFeuille", Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCompute} disabled={isPending} className="gap-2">
          <Calculator className="size-4" />
          {isPending ? "Calcul en cours…" : "Lancer le calcul des matériaux"}
          {!isPending && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
