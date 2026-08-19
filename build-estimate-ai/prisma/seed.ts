import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hashPassword } from "../src/lib/password";
import { computeEstimate } from "../src/lib/estimate";
import {
  DEFAULT_TECHNICAL_PARAMS,
  BuildingType,
  DetectedData,
  DetectedRoom,
  detectedToVerified,
} from "../src/lib/types";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// Données de démonstration synthétiques UNIQUEMENT pour peupler la base au
// premier lancement (aucun plan réel n'est fourni pour ces projets fixtures).
// La production utilise l'analyse IA réelle (src/lib/ai-analysis.ts).
function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

const ROOM_TEMPLATES = [
  { label: "Séjour", share: 0.22 },
  { label: "Cuisine", share: 0.1 },
  { label: "Chambre 1", share: 0.13 },
  { label: "Chambre 2", share: 0.12 },
  { label: "Salle de bain", share: 0.06 },
  { label: "Dégagement / Couloir", share: 0.08 },
];

function fixtureDetectedData(approxSurface: number, levels: number): DetectedData {
  const surfaceParNiveau = Math.max(approxSurface / Math.max(levels, 1), 20);
  const ratio = 1.3;
  const largeur = Math.sqrt(surfaceParNiveau / ratio);
  const longueur = largeur * ratio;
  const perimetre = 2 * (longueur + largeur);
  const totalShare = ROOM_TEMPLATES.reduce((s, r) => s + r.share, 0);

  const pieces: DetectedRoom[] = ROOM_TEMPLATES.map((tpl, i) => ({
    id: `piece-${i}`,
    label: tpl.label,
    surface: round((tpl.share / totalShare) * surfaceParNiveau * 0.92),
    score: 0.9,
  }));

  return {
    longueur: { label: "Longueur du bâtiment", value: round(longueur), unit: "m", score: 0.92 },
    largeur: { label: "Largeur du bâtiment", value: round(largeur), unit: "m", score: 0.92 },
    surface: { label: "Surface au sol", value: round(longueur * largeur), unit: "m²", score: 0.94 },
    niveaux: { label: "Nombre de niveaux", value: levels, unit: "", score: 0.98 },
    hauteurSousPlafond: { label: "Hauteur sous plafond", value: 2.8, unit: "m", score: 0.85 },
    longueurMurs: { label: "Linéaire de murs (par niveau)", value: round(perimetre * 1.35), unit: "m", score: 0.88 },
    nombrePortes: { label: "Portes détectées", value: 6, unit: "", score: 0.9 },
    nombreFenetres: { label: "Fenêtres détectées", value: 8, unit: "", score: 0.9 },
    pieces,
    confidenceGlobale: 0.9,
    avertissements: [],
    resumeAnalyse: "Projet de démonstration (données fixtures, pas d'analyse IA réelle exécutée).",
  };
}

interface SeedProjectInput {
  name: string;
  buildingType: BuildingType;
  location: string;
  levels: number;
  surface: number;
  daysAgo: number;
}

const SEED_PROJECTS: SeedProjectInput[] = [
  { name: "Villa Les Cocotiers", buildingType: "villa", location: "Abidjan, Côte d'Ivoire", levels: 2, surface: 220, daysAgo: 3 },
  { name: "Résidence Bel Air", buildingType: "immeuble", location: "Dakar, Sénégal", levels: 4, surface: 560, daysAgo: 9 },
  { name: "Maison M. Kouassi", buildingType: "maison", location: "Yamoussoukro, Côte d'Ivoire", levels: 1, surface: 110, daysAgo: 21 },
];

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const adminEmail = "admin@buildestimate.ai";
  const adminPasswordHash = await hashPassword("admin1234");
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrateur BuildEstimate",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });
  console.log(`Compte admin : ${adminEmail} / admin1234`);

  const email = "demo@buildestimate.ai";
  const passwordHash = await hashPassword("demo1234");

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Aïcha Koné",
      email,
      passwordHash,
      role: "architecte",
      company: "Atelier BT",
    },
  });

  console.log(`Utilisateur démo : ${email} / demo1234`);

  const existingProjects = await prisma.project.count({ where: { userId: user.id } });
  if (existingProjects > 0) {
    console.log(
      `${existingProjects} projet(s) déjà présents pour ce compte, seed des projets ignoré (idempotent).`
    );
    return;
  }

  for (const seed of SEED_PROJECTS) {
    const detected = fixtureDetectedData(seed.surface, seed.levels);
    const verified = detectedToVerified(detected);
    const params = { ...DEFAULT_TECHNICAL_PARAMS };
    const result = computeEstimate(verified, params);
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 3600 * 1000);

    await prisma.project.create({
      data: {
        userId: user.id,
        name: seed.name,
        buildingType: seed.buildingType,
        location: seed.location,
        levels: seed.levels,
        approxSurface: seed.surface,
        description: "",
        status: "calcule",
        createdAt,
        updatedAt: createdAt,
        planFile: {
          name: `${seed.name.replace(/\s+/g, "_")}.pdf`,
          size: 1_240_000,
          kind: "pdf",
          pageCount: 2,
          mimeType: "application/pdf",
          url: "",
        } satisfies Prisma.InputJsonValue,
        detectedData: detected as unknown as Prisma.InputJsonValue,
        verifiedData: verified as unknown as Prisma.InputJsonValue,
        technicalParams: params as unknown as Prisma.InputJsonValue,
        result: result as unknown as Prisma.InputJsonValue,
      },
    });
  }

  console.log(`${SEED_PROJECTS.length} projets de démonstration créés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
