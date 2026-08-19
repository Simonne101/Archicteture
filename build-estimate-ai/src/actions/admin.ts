"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin";
import { hashPassword } from "@/lib/password";
import { updatePlatformSettings } from "@/lib/platform-settings";

export interface AdminActionState {
  error?: string;
  success?: boolean;
}

const ROLES = [
  "architecte",
  "ingenieur",
  "technicien",
  "conducteur",
  "entrepreneur",
  "promoteur",
  "maitre_ouvrage",
  "autre",
  "admin",
];

const createUserSchema = z.object({
  firstname: z.string().trim().min(1, "Prénom requis"),
  lastname: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  role: z.enum(ROLES as [string, ...string[]]),
  password: z.string().min(6, "6 caractères minimum"),
});

export async function createUserByAdminAction(
  _prevState: AdminActionState | undefined,
  formData: FormData
): Promise<AdminActionState> {
  const admin = await requireAdminSession();

  const parsed = createUserSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { firstname, lastname, email, role, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      name: `${firstname} ${lastname}`,
      email,
      passwordHash,
      role,
      createdByAdminId: admin.id,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRoleAction(userId: string, role: string) {
  await requireAdminSession();
  if (!ROLES.includes(role)) throw new Error("Rôle invalide");
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const admin = await requireAdminSession();
  if (userId === admin.id) throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(
  _prevState: AdminActionState | undefined,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdminSession();
  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!userId || password.length < 6) {
    return { error: "Mot de passe : 6 caractères minimum." };
  }
  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdminSession();
  if (userId === admin.id) throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

const platformSettingsSchema = z.object({
  prixCimentSac: z.coerce.number().positive(),
  prixParpaing: z.coerce.number().positive(),
  prixFerBarre: z.coerce.number().positive(),
  prixSableM3: z.coerce.number().positive(),
  prixGravierM3: z.coerce.number().positive(),
  prixBoisM3: z.coerce.number().positive(),
  prixToleFeuille: z.coerce.number().positive(),
});

export async function updatePlatformSettingsAction(
  _prevState: AdminActionState | undefined,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdminSession();

  const parsed = platformSettingsSchema.safeParse({
    prixCimentSac: formData.get("prixCimentSac"),
    prixParpaing: formData.get("prixParpaing"),
    prixFerBarre: formData.get("prixFerBarre"),
    prixSableM3: formData.get("prixSableM3"),
    prixGravierM3: formData.get("prixGravierM3"),
    prixBoisM3: formData.get("prixBoisM3"),
    prixToleFeuille: formData.get("prixToleFeuille"),
  });

  if (!parsed.success) {
    return { error: "Merci de renseigner des prix valides (nombres positifs)." };
  }

  await updatePlatformSettings(parsed.data);
  revalidatePath("/admin/materiaux");
  return { success: true };
}
