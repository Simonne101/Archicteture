import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Project as DbProject } from "@/generated/prisma/client";
import {
  BuildingType,
  DetectedData,
  EstimateResult,
  PlanFileMeta,
  Project,
  ProjectStatus,
  TechnicalParams,
  VerifiedData,
} from "@/lib/types";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié");
  }
  return session.user.id;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return user;
}

function toProject(p: DbProject): Project {
  return {
    id: p.id,
    name: p.name,
    buildingType: p.buildingType as BuildingType,
    location: p.location,
    levels: p.levels,
    approxSurface: p.approxSurface,
    description: p.description,
    status: p.status as ProjectStatus,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    planFile: (p.planFile as unknown as PlanFileMeta | null) ?? undefined,
    detectedData: (p.detectedData as unknown as DetectedData | null) ?? undefined,
    verifiedData: (p.verifiedData as unknown as VerifiedData | null) ?? undefined,
    technicalParams: p.technicalParams as unknown as TechnicalParams,
    result: (p.result as unknown as EstimateResult | null) ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  const userId = await requireUserId();
  const rows = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toProject);
}

export const getProject = cache(async (id: string): Promise<Project | null> => {
  const userId = await requireUserId();
  const row = await prisma.project.findFirst({ where: { id, userId } });
  return row ? toProject(row) : null;
});
