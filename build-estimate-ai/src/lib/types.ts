export type BuildingType =
  | "maison"
  | "villa"
  | "immeuble"
  | "commercial"
  | "autre";

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  maison: "Maison individuelle",
  villa: "Villa",
  immeuble: "Immeuble",
  commercial: "Bâtiment commercial",
  autre: "Autre",
};

export type ProjectStatus =
  | "brouillon"
  | "plan_importe"
  | "analyse"
  | "verifie"
  | "calcule";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  brouillon: "Brouillon",
  plan_importe: "Plan importé",
  analyse: "Analysé",
  verifie: "Vérifié",
  calcule: "Estimation prête",
};

export type FileKind = "pdf" | "image";

export interface PlanFileMeta {
  name: string;
  size: number;
  kind: FileKind;
  pageCount?: number;
  mimeType: string;
  url: string;
}

export type Confidence = "haute" | "moyenne" | "faible";

export function confidenceFromScore(score: number): Confidence {
  if (score >= 0.85) return "haute";
  if (score >= 0.6) return "moyenne";
  return "faible";
}

export interface DetectedField<T = number> {
  label: string;
  value: T;
  unit?: string;
  score: number; // 0..1
}

export interface DetectedRoom {
  id: string;
  label: string;
  surface: number;
  score: number;
}

export interface DetectedData {
  longueur: DetectedField;
  largeur: DetectedField;
  surface: DetectedField;
  niveaux: DetectedField;
  hauteurSousPlafond: DetectedField;
  longueurMurs: DetectedField;
  nombrePortes: DetectedField;
  nombreFenetres: DetectedField;
  pieces: DetectedRoom[];
  confidenceGlobale: number; // 0..1, average reliability of the AI reading
  avertissements: string[]; // AI-flagged caveats (illegible zones, missing scale, etc.)
  resumeAnalyse: string; // one/two sentence summary of what the AI read from the plan
}

export interface VerifiedData {
  longueur: number;
  largeur: number;
  surface: number;
  niveaux: number;
  hauteurSousPlafond: number;
  longueurMurs: number;
  nombrePortes: number;
  nombreFenetres: number;
  pieces: DetectedRoom[];
}

export function detectedToVerified(detected: DetectedData): VerifiedData {
  return {
    longueur: detected.longueur.value,
    largeur: detected.largeur.value,
    surface: detected.surface.value,
    niveaux: detected.niveaux.value,
    hauteurSousPlafond: detected.hauteurSousPlafond.value,
    longueurMurs: detected.longueurMurs.value,
    nombrePortes: detected.nombrePortes.value,
    nombreFenetres: detected.nombreFenetres.value,
    pieces: detected.pieces,
  };
}

export type TypeFondation = "semelle_filante" | "radier" | "semelle_isolee";
export type TypeCharpente = "bois" | "metallique" | "dalle_beton";
export type TypeCouverture = "tole_bac_acier" | "tuile" | "dalle_beton";

export const TYPE_FONDATION_LABELS: Record<TypeFondation, string> = {
  semelle_filante: "Semelles filantes",
  radier: "Radier général",
  semelle_isolee: "Semelles isolées",
};

export const TYPE_CHARPENTE_LABELS: Record<TypeCharpente, string> = {
  bois: "Charpente bois",
  metallique: "Charpente métallique",
  dalle_beton: "Toiture dalle béton",
};

export const TYPE_COUVERTURE_LABELS: Record<TypeCouverture, string> = {
  tole_bac_acier: "Tôle bac acier",
  tuile: "Tuile",
  dalle_beton: "Dalle béton (toit-terrasse)",
};

export interface TechnicalParams {
  epaisseurMurs: number; // m
  epaisseurDalle: number; // m
  typeFondation: TypeFondation;
  typeCharpente: TypeCharpente;
  typeCouverture: TypeCouverture;
  dosageCimentBeton: number; // kg/m3
  tauxOuvertures: number; // 0..1, fraction of wall surface removed by doors/windows
  diametresFerraillage: number[]; // mm
  prixCimentSac: number; // FCFA / sac 50kg (editable)
  prixParpaing: number;
  prixFerBarre: number;
  prixSableM3: number;
  prixGravierM3: number;
  prixBoisM3: number;
  prixToleFeuille: number;
}

export const DEFAULT_TECHNICAL_PARAMS: TechnicalParams = {
  epaisseurMurs: 0.2,
  epaisseurDalle: 0.12,
  typeFondation: "semelle_filante",
  typeCharpente: "bois",
  typeCouverture: "tole_bac_acier",
  dosageCimentBeton: 350,
  tauxOuvertures: 0.15,
  diametresFerraillage: [8, 10, 12, 14],
  prixCimentSac: 5500,
  prixParpaing: 350,
  prixFerBarre: 6500,
  prixSableM3: 8000,
  prixGravierM3: 10000,
  prixBoisM3: 150000,
  prixToleFeuille: 4500,
};

export interface MaterialLine {
  label: string;
  quantity: number;
  unit: string;
  note?: string;
}

export interface OuvrageEstimate {
  key: string;
  label: string;
  lines: MaterialLine[];
}

export interface BarreFer {
  diametre: number;
  nombre: number;
}

export interface EstimateResult {
  ouvrages: OuvrageEstimate[];
  totals: {
    cimentSacs: number;
    sableM3: number;
    sableBrouettes: number;
    gravierM3: number;
    gravierBrouettes: number;
    betonM3: number;
    parpaings: number;
    boisM3: number;
    acierKg: number;
    barres: BarreFer[];
  };
  coutEstimeFCFA: number;
  computedAt: string;
}

export interface Project {
  id: string;
  name: string;
  buildingType: BuildingType;
  location: string;
  levels: number;
  approxSurface: number;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  planFile?: PlanFileMeta;
  detectedData?: DetectedData;
  verifiedData?: VerifiedData;
  technicalParams: TechnicalParams;
  result?: EstimateResult;
}
