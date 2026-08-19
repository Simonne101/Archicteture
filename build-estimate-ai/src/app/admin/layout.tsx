import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="flex items-center gap-2.5 border-b px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Administration</p>
            <p className="text-xs text-muted-foreground">BuildEstimate AI</p>
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto border-t p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftRight className="size-4" />
            Retour à l&apos;application
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-5 py-3 lg:hidden">
          <span className="font-heading text-sm font-semibold">Administration</span>
          <Link href="/dashboard" className="text-xs text-primary">
            Retour à l&apos;app
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
