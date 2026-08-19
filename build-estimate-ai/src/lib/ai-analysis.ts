import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { DetectedData, DetectedField, DetectedRoom, PlanFileMeta } from "./types";

const GEMINI_MODEL = "gemini-3.1-pro-preview";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]);

async function getPlanFileBase64(planFile: PlanFileMeta): Promise<string> {
  if (planFile.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", planFile.url);
    const buffer = await readFile(filePath);
    return buffer.toString("base64");
  }
  const res = await fetch(planFile.url);
  if (!res.ok) {
    throw new Error(`Impossible de récupérer le fichier du plan (HTTP ${res.status}).`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}

const numberScoreSchema = {
  type: "object",
  properties: {
    value: { type: "number" },
    score: { type: "number" },
  },
  required: ["value", "score"],
};

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    longueur: numberScoreSchema,
    largeur: numberScoreSchema,
    surface: numberScoreSchema,
    niveaux: numberScoreSchema,
    hauteurSousPlafond: numberScoreSchema,
    longueurMurs: numberScoreSchema,
    nombrePortes: numberScoreSchema,
    nombreFenetres: numberScoreSchema,
    pieces: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          surface: { type: "number" },
          score: { type: "number" },
        },
        required: ["label", "surface", "score"],
      },
    },
    confidenceGlobale: { type: "number" },
    avertissements: { type: "array", items: { type: "string" } },
    resumeAnalyse: { type: "string" },
  },
  required: [
    "longueur",
    "largeur",
    "surface",
    "niveaux",
    "hauteurSousPlafond",
    "longueurMurs",
    "nombrePortes",
    "nombreFenetres",
    "pieces",
    "confidenceGlobale",
    "avertissements",
    "resumeAnalyse",
  ],
} as const;

interface RawAnalysis {
  longueur: { value: number; score: number };
  largeur: { value: number; score: number };
  surface: { value: number; score: number };
  niveaux: { value: number; score: number };
  hauteurSousPlafond: { value: number; score: number };
  longueurMurs: { value: number; score: number };
  nombrePortes: { value: number; score: number };
  nombreFenetres: { value: number; score: number };
  pieces: { label: string; surface: number; score: number }[];
  confidenceGlobale: number;
  avertissements: string[];
  resumeAnalyse: string;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function field(label: string, unit: string, raw: { value: number; score: number }): DetectedField {
  return {
    label,
    unit,
    value: Number.isFinite(raw.value) ? raw.value : 0,
    score: clamp01(raw.score),
  };
}

function toDetectedData(raw: RawAnalysis): DetectedData {
  const pieces: DetectedRoom[] = raw.pieces.map((p, i) => ({
    id: `piece-${i}`,
    label: p.label,
    surface: Number.isFinite(p.surface) ? p.surface : 0,
    score: clamp01(p.score),
  }));

  return {
    longueur: field("Longueur du bâtiment", "m", raw.longueur),
    largeur: field("Largeur du bâtiment", "m", raw.largeur),
    surface: field("Surface au sol", "m²", raw.surface),
    niveaux: field("Nombre de niveaux", "", raw.niveaux),
    hauteurSousPlafond: field("Hauteur sous plafond", "m", raw.hauteurSousPlafond),
    longueurMurs: field("Linéaire de murs (par niveau)", "m", raw.longueurMurs),
    nombrePortes: field("Portes détectées", "", raw.nombrePortes),
    nombreFenetres: field("Fenêtres détectées", "", raw.nombreFenetres),
    pieces,
    confidenceGlobale: clamp01(raw.confidenceGlobale),
    avertissements: Array.isArray(raw.avertissements) ? raw.avertissements : [],
    resumeAnalyse: raw.resumeAnalyse || "",
  };
}

function buildPrompt(approxSurface: number, levels: number, buildingType: string, location: string) {
  return `Tu es un métreur / ingénieur BTP expert en lecture de plans architecturaux, spécialisé sur les pratiques de construction d'Afrique de l'Ouest (parpaings, ferraillage HA, dosage béton en sacs de 50kg).

On te fournit le plan (image ou document PDF) d'un projet de construction. Analyse-le avec la plus grande rigueur possible et extrait les informations suivantes :

- Longueur et largeur hors-tout du bâtiment (m)
- Surface au sol (m²)
- Nombre de niveaux (étages, y compris rez-de-chaussée)
- Hauteur sous plafond typique (m) — si non indiquée sur le plan, utilise une valeur standard plausible (2.7 à 3.0 m) et signale-le dans les avertissements
- Linéaire total de murs par niveau (m) — somme des longueurs de tous les murs porteurs et de refend visibles
- Nombre de portes et de fenêtres visibles sur le plan
- Liste des pièces identifiées avec leur surface approximative (m²)

Contexte fourni par l'utilisateur lors de la création du projet (à utiliser comme repère de cohérence, PAS comme valeur à recopier aveuglément si le plan indique autre chose) : type de bâtiment "${buildingType}", localisation "${location}", surface approximative déclarée ${approxSurface} m², nombre de niveaux déclaré ${levels}.

Pour CHAQUE valeur extraite, attribue un score de confiance entre 0 et 1 reflétant honnêtement la lisibilité du plan pour cette mesure précise (échelle absente, cotes manquantes, résolution insuffisante, texte illisible → score bas). Ne survalorise jamais ta confiance : si tu dois estimer ou déduire une valeur plutôt que la lire directement, le score doit refléter cette incertitude.

Calcule aussi une confidenceGlobale (moyenne pondérée honnête de tous les scores) et liste dans avertissements tout élément qui limite la fiabilité de cette analyse (échelle du plan non indiquée, plan de mauvaise qualité, zones illisibles, cotes manquantes, plan ne semblant pas être un plan de construction, etc.). Si le document fourni n'est manifestement pas un plan architectural exploitable, mets confidenceGlobale à une valeur très basse (< 0.2) et explique pourquoi dans avertissements et resumeAnalyse.

Rédige resumeAnalyse en une ou deux phrases résumant ce que tu as pu lire sur ce plan et le niveau de fiabilité global, à destination d'un professionnel du BTP qui va vérifier ces données avant de les valider.

Réponds UNIQUEMENT avec un objet JSON conforme au schéma fourni, sans texte additionnel.`;
}

export async function analyzePlanWithAI(
  planFile: PlanFileMeta,
  approxSurface: number,
  levels: number,
  buildingType: string,
  location: string
): Promise<DetectedData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "L'analyse IA n'est pas configurée sur ce serveur (clé GEMINI_API_KEY manquante). Contactez l'administrateur de la plateforme."
    );
  }

  const base64 = await getPlanFileBase64(planFile);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const filePart =
    planFile.kind === "pdf"
      ? ({ type: "document", data: base64, mime_type: "application/pdf" } as const)
      : ({
          type: "image",
          data: base64,
          mime_type: SUPPORTED_IMAGE_TYPES.has(planFile.mimeType) ? planFile.mimeType : "image/png",
        } as const);

  let outputText: string | undefined;
  try {
    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: [
        { type: "text", text: buildPrompt(approxSurface, levels, buildingType, location) },
        filePart,
      ],
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: ANALYSIS_SCHEMA,
      },
    });
    outputText = interaction.output_text;
  } catch (err) {
    throw new Error(
      `L'analyse IA a échoué : ${err instanceof Error ? err.message : "erreur inconnue"}. Réessayez dans quelques instants.`
    );
  }

  if (!outputText) {
    throw new Error(
      "L'IA n'a pas pu analyser ce document (réponse vide). Vérifiez qu'il s'agit bien d'un plan de construction lisible."
    );
  }

  let parsed: RawAnalysis;
  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("La réponse de l'IA n'a pas pu être interprétée. Réessayez.");
  }

  return toDetectedData(parsed);
}
