import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersClient } from "@/components/admin/users-client";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <UsersClient
      currentUserId={session!.user.id}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        company: u.company,
        active: u.active,
        createdAt: u.createdAt.toISOString(),
        projectCount: u._count.projects,
        createdByAdmin: !!u.createdByAdminId,
      }))}
    />
  );
}
