import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import Field from "../ui/Field";
import { buttonClasses } from "../../utils/buttonStyles";
import { projectInputService } from "../../services/projectInput.service";
import { materialService, type Material } from "../../services/material.service";
import { ApiError } from "../../services/api";
import type { ProjectInput } from "../../services/types";

interface SectionProps<T> {
  title: string;
  description: string;
  value: T;
  onSave: (value: T) => Promise<void>;
  children: (value: T, setValue: (value: T) => void) => React.ReactNode;
}

function Section<T>({ title, description, value, onSave, children }: SectionProps<T>) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(value), [value]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-6 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
      <h3 className="font-bold text-text-dark">{title}</h3>
      <p className="mb-4 text-sm text-text-dark/60">{description}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children(draft, setDraft)}</div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={buttonClasses("outline", "mt-4 h-10 border-black/10 px-4 text-text-dark disabled:opacity-60")}
      >
        {saved ? (
          <>
            <Check size={16} aria-hidden="true" /> Enregistré
          </>
        ) : saving ? (
          "Enregistrement..."
        ) : (
          "Enregistrer cette section"
        )}
      </button>
    </div>
  );
}

function numberOrUndefined(raw: string): number | undefined {
  return raw === "" ? undefined : Number(raw);
}

function MaterialsSection({
  materials,
  onSave,
}: {
  materials: { material_code: string }[];
  onSave: (materials: { material_code: string }[]) => Promise<void>;
}) {
  const [catalog, setCatalog] = useState<Material[] | null>(null);
  const [selected, setSelected] = useState(new Set(materials.map((m) => m.material_code)));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    materialService.list().then(setCatalog);
  }, []);

  useEffect(() => {
    setSelected(new Set(materials.map((m) => m.material_code)));
  }, [materials]);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(Array.from(selected).map((material_code) => ({ material_code })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-6 shadow-[0_14px_34px_rgba(3,18,38,0.06)]">
      <h3 className="font-bold text-text-dark">Matériaux</h3>
      <p className="mb-4 text-sm text-text-dark/60">
        Sélectionnez les matériaux à considérer pour ce projet (facultatif — l&apos;estimation en propose déjà par défaut).
      </p>

      {!catalog && <p className="text-sm text-text-dark/50">Chargement du catalogue…</p>}

      {catalog && (
        <div className="grid gap-2 sm:grid-cols-2">
          {catalog.map((material) => (
            <label key={material.code} className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-sm text-text-dark">
              <input
                type="checkbox"
                checked={selected.has(material.code)}
                onChange={() => toggle(material.code)}
                className="h-4 w-4 accent-primary"
              />
              {material.name} <span className="text-text-dark/40">({material.unit})</span>
            </label>
          ))}
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className={buttonClasses("outline", "mt-4 h-10 border-black/10 px-4 text-text-dark disabled:opacity-60")}
      >
        {saved ? (
          <>
            <Check size={16} aria-hidden="true" /> Enregistré
          </>
        ) : saving ? (
          "Enregistrement..."
        ) : (
          "Enregistrer cette section"
        )}
      </button>
    </div>
  );
}

export default function ProjectInputForm({
  projectId,
  input,
  onSaved,
}: {
  projectId: string;
  input: ProjectInput;
  onSaved: (input: ProjectInput) => void;
}) {
  async function save(section: Partial<ProjectInput>) {
    const updated = await projectInputService.save(projectId, section);
    onSaved(updated);
  }

  return (
    <div className="flex flex-col gap-5">
      {!input.can_estimate && (
        <p className="rounded-lg border border-accent-orange/30 bg-accent-orange/10 px-4 py-3 text-sm text-text-dark">
          Informations nécessaires avant de pouvoir estimer : renseignez au minimum la surface,
          le nombre de niveaux et les murs — ou complétez-les automatiquement via l&apos;analyse du plan.
        </p>
      )}

      <Section
        title="Dimensions"
        description="Terrain et bâtiment."
        value={input.dimensions}
        onSave={(dimensions) => save({ dimensions })}
      >
        {(v, set) => (
          <>
            <Field label="Longueur du terrain (m)" type="number" min={0} step="0.01" value={v.land_length ?? ""} onChange={(e) => set({ ...v, land_length: numberOrUndefined(e.target.value) })} />
            <Field label="Largeur du terrain (m)" type="number" min={0} step="0.01" value={v.land_width ?? ""} onChange={(e) => set({ ...v, land_width: numberOrUndefined(e.target.value) })} />
            <Field label="Longueur du bâtiment (m)" type="number" min={0} step="0.01" value={v.building_length ?? ""} onChange={(e) => set({ ...v, building_length: numberOrUndefined(e.target.value) })} />
            <Field label="Largeur du bâtiment (m)" type="number" min={0} step="0.01" value={v.building_width ?? ""} onChange={(e) => set({ ...v, building_width: numberOrUndefined(e.target.value) })} />
            <Field label="Surface approximative (m²)" type="number" min={0} step="0.01" value={v.approximate_surface ?? ""} onChange={(e) => set({ ...v, approximate_surface: numberOrUndefined(e.target.value) })} />
          </>
        )}
      </Section>

      <Section
        title="Structure"
        description="Niveaux, hauteur, types principaux."
        value={input.structure}
        onSave={(structure) => save({ structure })}
      >
        {(v, set) => (
          <>
            <Field label="Nombre de niveaux" type="number" min={1} step="1" value={v.levels ?? ""} onChange={(e) => set({ ...v, levels: numberOrUndefined(e.target.value) })} />
            <Field label="Hauteur sous plafond (m)" type="number" min={0} step="0.01" value={v.ceiling_height ?? ""} onChange={(e) => set({ ...v, ceiling_height: numberOrUndefined(e.target.value) })} />
            <Field label="Type de fondation" value={v.foundation_type ?? ""} onChange={(e) => set({ ...v, foundation_type: e.target.value })} />
            <Field label="Type de dalle" value={v.slab_type ?? ""} onChange={(e) => set({ ...v, slab_type: e.target.value })} />
            <Field label="Type de toiture" value={v.roof_type ?? ""} onChange={(e) => set({ ...v, roof_type: e.target.value })} />
          </>
        )}
      </Section>

      <Section
        title="Fondations"
        description="Semelles."
        value={input.foundations}
        onSave={(foundations) => save({ foundations })}
      >
        {(v, set) => (
          <>
            <Field label="Type de semelle" value={v.footing_type ?? ""} onChange={(e) => set({ ...v, footing_type: e.target.value })} />
            <Field label="Profondeur (m)" type="number" min={0} step="0.01" value={v.depth ?? ""} onChange={(e) => set({ ...v, depth: numberOrUndefined(e.target.value) })} />
            <Field label="Largeur (m)" type="number" min={0} step="0.01" value={v.width ?? ""} onChange={(e) => set({ ...v, width: numberOrUndefined(e.target.value) })} />
            <Field label="Longueur (m)" type="number" min={0} step="0.01" value={v.length ?? ""} onChange={(e) => set({ ...v, length: numberOrUndefined(e.target.value) })} />
          </>
        )}
      </Section>

      <Section
        title="Murs"
        description="Épaisseur, hauteur, matériau."
        value={input.walls}
        onSave={(walls) => save({ walls })}
      >
        {(v, set) => (
          <>
            <Field label="Épaisseur (m)" type="number" min={0} step="0.01" value={v.thickness ?? ""} onChange={(e) => set({ ...v, thickness: numberOrUndefined(e.target.value) })} />
            <Field label="Hauteur (m)" type="number" min={0} step="0.01" value={v.height ?? ""} onChange={(e) => set({ ...v, height: numberOrUndefined(e.target.value) })} />
            <Field label="Type de blocs/briques" value={v.block_type ?? ""} onChange={(e) => set({ ...v, block_type: e.target.value })} />
          </>
        )}
      </Section>

      <Section
        title="Ouvertures"
        description="Portes et fenêtres."
        value={input.openings}
        onSave={(openings) => save({ openings })}
      >
        {(v, set) => (
          <>
            <Field label="Nombre de portes" type="number" min={0} step="1" value={v.door_count ?? ""} onChange={(e) => set({ ...v, door_count: numberOrUndefined(e.target.value) })} />
            <Field label="Nombre de fenêtres" type="number" min={0} step="1" value={v.window_count ?? ""} onChange={(e) => set({ ...v, window_count: numberOrUndefined(e.target.value) })} />
          </>
        )}
      </Section>

      <Section
        title="Toiture"
        description="Type, surface, pente, couverture."
        value={input.roofing}
        onSave={(roofing) => save({ roofing })}
      >
        {(v, set) => (
          <>
            <Field label="Type" value={v.type ?? ""} onChange={(e) => set({ ...v, type: e.target.value })} />
            <Field label="Surface (m²)" type="number" min={0} step="0.01" value={v.surface ?? ""} onChange={(e) => set({ ...v, surface: numberOrUndefined(e.target.value) })} />
            <Field label="Pente (%)" type="number" min={0} step="0.01" value={v.pitch ?? ""} onChange={(e) => set({ ...v, pitch: numberOrUndefined(e.target.value) })} />
            <Field label="Couverture" value={v.covering ?? ""} onChange={(e) => set({ ...v, covering: e.target.value })} />
          </>
        )}
      </Section>

      <Section
        title="Structure en béton armé"
        description="Poteaux, poutres, dalles, diamètre des armatures."
        value={input.reinforced_concrete}
        onSave={(reinforced_concrete) => save({ reinforced_concrete })}
      >
        {(v, set) => (
          <>
            <Field
              label="Diamètre des armatures (mm)"
              type="number"
              min={0}
              step="1"
              value={v.rebar_diameter_mm ?? ""}
              onChange={(e) => set({ ...v, rebar_diameter_mm: numberOrUndefined(e.target.value) })}
            />

            <div className="sm:col-span-2 flex flex-col gap-3">
              <div>
                <p className="mb-2 text-sm font-semibold text-text-dark">Poteaux</p>
                {(v.columns ?? []).map((col, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Nombre"
                      value={col.count}
                      onChange={(e) => {
                        const columns = [...(v.columns ?? [])];
                        columns[i] = { ...columns[i], count: Number(e.target.value) };
                        set({ ...v, columns });
                      }}
                      className="h-10 w-24 rounded-lg border border-black/10 px-2.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Section (ex: 20x20)"
                      value={col.section ?? ""}
                      onChange={(e) => {
                        const columns = [...(v.columns ?? [])];
                        columns[i] = { ...columns[i], section: e.target.value };
                        set({ ...v, columns });
                      }}
                      className="h-10 flex-1 rounded-lg border border-black/10 px-2.5 text-sm"
                    />
                    <button type="button" onClick={() => set({ ...v, columns: (v.columns ?? []).filter((_, j) => j !== i) })} aria-label="Supprimer">
                      <Trash2 size={16} className="text-text-dark/40 hover:text-red-600" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set({ ...v, columns: [...(v.columns ?? []), { count: 0 }] })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={14} aria-hidden="true" /> Ajouter
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-text-dark">Poutres</p>
                {(v.beams ?? []).map((beam, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Nombre"
                      value={beam.count}
                      onChange={(e) => {
                        const beams = [...(v.beams ?? [])];
                        beams[i] = { ...beams[i], count: Number(e.target.value) };
                        set({ ...v, beams });
                      }}
                      className="h-10 w-24 rounded-lg border border-black/10 px-2.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Section (ex: 20x30)"
                      value={beam.section ?? ""}
                      onChange={(e) => {
                        const beams = [...(v.beams ?? [])];
                        beams[i] = { ...beams[i], section: e.target.value };
                        set({ ...v, beams });
                      }}
                      className="h-10 flex-1 rounded-lg border border-black/10 px-2.5 text-sm"
                    />
                    <button type="button" onClick={() => set({ ...v, beams: (v.beams ?? []).filter((_, j) => j !== i) })} aria-label="Supprimer">
                      <Trash2 size={16} className="text-text-dark/40 hover:text-red-600" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set({ ...v, beams: [...(v.beams ?? []), { count: 0 }] })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={14} aria-hidden="true" /> Ajouter
                </button>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-text-dark">Dalles (épaisseur, m)</p>
                {(v.slabs ?? []).map((slab, i) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={slab.thickness}
                      onChange={(e) => {
                        const slabs = [...(v.slabs ?? [])];
                        slabs[i] = { thickness: Number(e.target.value) };
                        set({ ...v, slabs });
                      }}
                      className="h-10 w-32 rounded-lg border border-black/10 px-2.5 text-sm"
                    />
                    <button type="button" onClick={() => set({ ...v, slabs: (v.slabs ?? []).filter((_, j) => j !== i) })} aria-label="Supprimer">
                      <Trash2 size={16} className="text-text-dark/40 hover:text-red-600" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set({ ...v, slabs: [...(v.slabs ?? []), { thickness: 0 }] })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={14} aria-hidden="true" /> Ajouter
                </button>
              </div>
            </div>
          </>
        )}
      </Section>

      <MaterialsSection materials={input.materials} onSave={(materials) => save({ materials })} />
    </div>
  );
}
