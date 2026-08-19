import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TECHNICAL_PARAMS, TechnicalParams } from "@/lib/types";

const SINGLETON_ID = 1;

export async function getPlatformSettings() {
  const existing = await prisma.platformSettings.findUnique({ where: { id: SINGLETON_ID } });
  if (existing) return existing;
  return prisma.platformSettings.create({ data: { id: SINGLETON_ID } });
}

export async function updatePlatformSettings(data: {
  prixCimentSac: number;
  prixParpaing: number;
  prixFerBarre: number;
  prixSableM3: number;
  prixGravierM3: number;
  prixBoisM3: number;
  prixToleFeuille: number;
}) {
  return prisma.platformSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...data },
    update: data,
  });
}

export async function getDefaultTechnicalParams(): Promise<TechnicalParams> {
  const settings = await getPlatformSettings();
  return {
    ...DEFAULT_TECHNICAL_PARAMS,
    prixCimentSac: settings.prixCimentSac,
    prixParpaing: settings.prixParpaing,
    prixFerBarre: settings.prixFerBarre,
    prixSableM3: settings.prixSableM3,
    prixGravierM3: settings.prixGravierM3,
    prixBoisM3: settings.prixBoisM3,
    prixToleFeuille: settings.prixToleFeuille,
  };
}
