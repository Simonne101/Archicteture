import "server-only";
import { auth } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Accès réservé à l'administrateur.");
  }
  return session.user;
}
