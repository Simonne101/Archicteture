"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePlatformSettingsAction } from "@/actions/admin";

interface PlatformPricing {
  prixCimentSac: number;
  prixParpaing: number;
  prixFerBarre: number;
  prixSableM3: number;
  prixGravierM3: number;
  prixBoisM3: number;
  prixToleFeuille: number;
}

const FIELDS: { key: keyof PlatformPricing; label: string; unit: string }[] = [
  { key: "prixCimentSac", label: "Sac de ciment 50kg", unit: "FCFA / sac" },
  { key: "prixParpaing", label: "Parpaing 20x20x40", unit: "FCFA / unité" },
  { key: "prixFerBarre", label: "Barre d'acier 12m", unit: "FCFA / barre" },
  { key: "prixSableM3", label: "Sable", unit: "FCFA / m³" },
  { key: "prixGravierM3", label: "Gravier", unit: "FCFA / m³" },
  { key: "prixBoisM3", label: "Bois de charpente", unit: "FCFA / m³" },
  { key: "prixToleFeuille", label: "Feuille de tôle bac acier", unit: "FCFA / feuille" },
];

export function MaterialsSettingsClient({ settings }: { settings: PlatformPricing }) {
  const [state, formAction, pending] = useActionState(updatePlatformSettingsAction, undefined);

  useEffect(() => {
    if (state?.success) toast.success("Prix de référence mis à jour");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Matériaux &amp; prix</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces prix de référence pré-remplissent les paramètres techniques de
          chaque nouveau projet. Les utilisateurs peuvent les ajuster
          individuellement selon leur chantier.
        </p>
      </div>

      <form action={formAction}>
        <Card className="gap-5 p-5 sm:p-6">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Boxes className="size-4.5 text-primary" />
              Prix unitaires de référence
            </CardTitle>
            <CardDescription>
              Utilisés par défaut pour l&apos;estimation financière des nouveaux projets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 p-0 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={f.key}
                    name={f.key}
                    type="number"
                    min={0}
                    defaultValue={settings[f.key]}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{f.unit}</span>
              </div>
            ))}
          </CardContent>
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={pending} className="gap-1.5">
              <Save className="size-4" />
              {pending ? "Enregistrement…" : "Enregistrer les prix"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
