"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus2,
  FileStack,
  Calculator,
  FileBarChart,
  Settings,
  HardHat,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/dashboard/user-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Vue générale", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Mes projets", icon: FolderKanban },
  { href: "/dashboard/plans", label: "Plans", icon: FileStack },
  { href: "/dashboard/estimations", label: "Estimations", icon: Calculator },
  { href: "/dashboard/reports", label: "Rapports", icon: FileBarChart },
];

export function AppSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HardHat className="size-4.5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading font-semibold">
                    BuildEstimate AI
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Estimation de matériaux
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-sidebar-primary/15 text-sidebar-primary hover:bg-sidebar-primary/25 hover:text-sidebar-primary">
                  <Link href="/dashboard/projects/new">
                    <FilePlus2 />
                    <span>Nouveau projet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user.role === "admin" && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/admin")} tooltip="Administration">
                <Link href="/admin">
                  <ShieldCheck />
                  <span>Administration</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Paramètres">
              <Link href="/dashboard/settings">
                <Settings />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 pb-1 pt-1">
          <Button asChild size="sm" className="w-full gap-1.5">
            <Link href="/dashboard/projects/new">
              <Plus className="size-4" />
              Créer un projet
            </Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
