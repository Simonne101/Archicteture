"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/queries";
import { uploadAvatarFile } from "@/lib/storage";

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

const profileSchema = z.object({
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  role: z.string().trim().min(1),
  company: z.string().trim().optional(),
});

export async function updateProfileAction(
  _prevState: ProfileActionState | undefined,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await requireUserId();

  const parsed = profileSchema.safeParse({
    firstname: formData.get("firstname"),
    lastname: formData.get("lastname"),
    role: formData.get("role"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    return { error: "Merci de renseigner votre prénom et votre nom." };
  }

  const { firstname, lastname, role, company } = parsed.data;
  const notifyEmail = formData.get("notifyEmail") === "on";
  const notifyAnalysisDone = formData.get("notifyAnalysisDone") === "on";

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: `${firstname} ${lastname}`,
      role,
      company: company || null,
      notifyEmail,
      notifyAnalysisDone,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateAvatarAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const userId = await requireUserId();

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (!file.type.startsWith("image/")) return { error: "Le fichier doit être une image." };
  if (file.size > 4 * 1024 * 1024) return { error: "Image trop volumineuse (4 Mo max)." };

  const url = await uploadAvatarFile(file, userId);
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });

  revalidatePath("/dashboard/settings");
  return { url };
}
