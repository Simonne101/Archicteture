"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn, signOut } from "@/lib/auth";

export interface AuthActionState {
  error?: string;
}

const signupSchema = z.object({
  firstname: z.string().trim().min(1, "Prénom requis"),
  lastname: z.string().trim().min(1, "Nom requis"),
  email: z.string().trim().email("Adresse e-mail invalide"),
  role: z.string().trim().min(1),
  password: z.string().min(6, "6 caractères minimum"),
});

export async function signupAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = signupSchema.safeParse({
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
    data: { name: `${firstname} ${lastname}`, email, passwordHash, role },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function loginAction(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou mot de passe incorrect." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
