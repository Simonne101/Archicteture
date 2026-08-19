"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/queries";
import { uploadPlanFile } from "@/lib/storage";
import { estimatePdfPageCount } from "@/lib/pdf-utils";
import { analyzePlanWithAI } from "@/lib/ai-analysis";
import { getDefaultTechnicalParams } from "@/lib/platform-settings";
import { computeEstimate } from "@/lib/estimate";
import {
  BuildingType,
  FileKind,
  PlanFileMeta,
  TechnicalParams,
  VerifiedData,
  detectedToVerified,
} from "@/lib/types";

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function requireOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Projet introuvable");
  return project;
}

async function storePlanFile(file: File, projectId: string) {
  const kind: FileKind = file.type === "application/pdf" ? "pdf" : "image";
  const url = await uploadPlanFile(file, projectId);
  const pageCount = kind === "pdf" ? await estimatePdfPageCount(file) : 1;
  return {
    name: file.name,
    size: file.size,
    kind,
    mimeType: file.type,
    pageCount,
    url,
  };
}

export async function createProjectAction(formData: FormData) {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  const buildingType = String(formData.get("buildingType") ?? "maison") as BuildingType;
  const location = String(formData.get("location") ?? "").trim();
  const levels = Number(formData.get("levels") ?? 1);
  const approxSurface = Number(formData.get("surface") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const file = formData.get("planFile") as File | null;

  if (!name || !location || !(levels >= 1) || !(approxSurface > 0) || !file || file.size === 0) {
    throw new Error("Champs invalides");
  }

  const defaultParams = await getDefaultTechnicalParams();

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      buildingType,
      location,
      levels,
      approxSurface,
      description,
      status: "brouillon",
      technicalParams: toJson(defaultParams),
    },
  });

  const planFile = await storePlanFile(file, project.id);

  await prisma.project.update({
    where: { id: project.id },
    data: { planFile: toJson(planFile), status: "plan_importe" },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${project.id}/analysis`);
}

export async function replacePlanFileAction(projectId: string, formData: FormData) {
  const userId = await requireUserId();
  await requireOwnedProject(projectId, userId);

  const file = formData.get("planFile") as File | null;
  if (!file || file.size === 0) throw new Error("Aucun fichier fourni");

  const planFile = await storePlanFile(file, projectId);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      planFile: toJson(planFile),
      status: "plan_importe",
      detectedData: Prisma.JsonNull,
      verifiedData: Prisma.JsonNull,
      result: Prisma.JsonNull,
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function removePlanFileAction(projectId: string) {
  const userId = await requireUserId();
  await requireOwnedProject(projectId, userId);

  await prisma.project.update({
    where: { id: projectId },
    data: { planFile: Prisma.JsonNull, status: "brouillon" },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export interface AnalysisActionResult {
  success: boolean;
  error?: string;
}

export async function runAnalysisAction(projectId: string): Promise<AnalysisActionResult> {
  const userId = await requireUserId();
  const project = await requireOwnedProject(projectId, userId);

  if (!project.planFile) {
    return { success: false, error: "Aucun plan n'a été importé pour ce projet." };
  }

  let detected;
  try {
    detected = await analyzePlanWithAI(
      project.planFile as unknown as PlanFileMeta,
      project.approxSurface,
      project.levels,
      project.buildingType,
      project.location
    );
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "L'analyse a échoué pour une raison inconnue.",
    };
  }

  const verified = detectedToVerified(detected);

  await prisma.project.update({
    where: { id: projectId },
    data: {
      detectedData: toJson(detected),
      verifiedData: toJson(verified),
      status: "analyse",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function confirmVerificationAction(
  projectId: string,
  verified: VerifiedData
) {
  const userId = await requireUserId();
  await requireOwnedProject(projectId, userId);

  await prisma.project.update({
    where: { id: projectId },
    data: { verifiedData: toJson(verified), status: "verifie" },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function computeResultAction(
  projectId: string,
  params: TechnicalParams
) {
  const userId = await requireUserId();
  const project = await requireOwnedProject(projectId, userId);

  if (!project.verifiedData) {
    throw new Error("Les données du projet doivent être vérifiées avant le calcul.");
  }

  const result = computeEstimate(
    project.verifiedData as unknown as VerifiedData,
    params
  );

  await prisma.project.update({
    where: { id: projectId },
    data: {
      technicalParams: toJson(params),
      result: toJson(result),
      status: "calcule",
    },
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}/results`);
}

export async function deleteProjectAction(projectId: string) {
  const userId = await requireUserId();
  await prisma.project.deleteMany({ where: { id: projectId, userId } });
  revalidatePath("/dashboard/projects");
}
