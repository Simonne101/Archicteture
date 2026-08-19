"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BUILDING_TYPE_LABELS, Project } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { wizardHrefForProject } from "@/lib/wizard-nav";
import { deleteProjectAction } from "@/actions/projects";

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [items, setItems] = useState(projects);
  const [isPending, startTransition] = useTransition();

  const q = query.toLowerCase();
  const filtered = items.filter(
    (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
  );

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      try {
        await deleteProjectAction(id);
      } catch {
        toast.error("Impossible de supprimer le projet.");
        setItems(projects);
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/dashboard/projects/new">
            <Plus className="size-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-14 text-center">
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "Vous n'avez pas encore de projet."
                : "Aucun projet ne correspond à votre recherche."}
            </p>
            {items.length === 0 && (
              <Button size="sm" asChild>
                <Link href="/dashboard/projects/new">Créer mon premier projet</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Mis à jour</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className={isPending ? "opacity-60" : undefined}>
                    <TableCell className="font-medium">
                      <Link href={wizardHrefForProject(p)} className="hover:underline">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {BUILDING_TYPE_LABELS[p.buildingType]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.location}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(p.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={wizardHrefForProject(p)}>
                              <Eye />
                              Ouvrir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
