"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus, KeyRound, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import {
  createUserByAdminAction,
  deleteUserAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
  updateUserRoleAction,
} from "@/actions/admin";

const ROLE_LABELS: Record<string, string> = {
  architecte: "Architecte",
  ingenieur: "Ingénieur",
  technicien: "Technicien BTP",
  conducteur: "Conducteur de travaux",
  entrepreneur: "Entrepreneur",
  promoteur: "Promoteur immobilier",
  maitre_ouvrage: "Maître d'ouvrage",
  autre: "Autre",
  admin: "Administrateur",
};

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string | null;
  active: boolean;
  createdAt: string;
  projectCount: number;
  createdByAdmin: boolean;
}

export function UsersClient({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUserRow | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez des profils pour votre équipe et gérez les accès à la plateforme.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <UserPlus className="size-4" />
              Créer un profil
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <CreateUserForm onCreated={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Projets</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={u.role}
                    onValueChange={(role) =>
                      startTransition(async () => {
                        await updateUserRoleAction(u.id, role);
                        toast.success("Rôle mis à jour");
                      })
                    }
                  >
                    <SelectTrigger className="h-8 w-auto text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={u.active ? "secondary" : "destructive"}>
                    {u.active ? "Actif" : "Désactivé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{u.projectCount}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" disabled={isPending}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setResetTarget(u)}>
                        <KeyRound className="size-4" />
                        Réinitialiser le mot de passe
                      </DropdownMenuItem>
                      {u.id !== currentUserId && (
                        <DropdownMenuItem
                          onClick={() =>
                            startTransition(async () => {
                              await toggleUserActiveAction(u.id, !u.active);
                              toast.success(u.active ? "Compte désactivé" : "Compte réactivé");
                            })
                          }
                        >
                          {u.active ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
                          {u.active ? "Désactiver" : "Réactiver"}
                        </DropdownMenuItem>
                      )}
                      {u.id !== currentUserId && u.projectCount === 0 && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Supprimer définitivement le compte de ${u.name} ?`)) {
                              startTransition(async () => {
                                await deleteUserAction(u.id);
                                toast.success("Compte supprimé");
                              });
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          {resetTarget && (
            <ResetPasswordForm user={resetTarget} onDone={() => setResetTarget(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [state, formAction, pending] = useActionState(createUserByAdminAction, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Profil créé");
      onCreated();
    }
  }, [state, onCreated]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Créer un profil utilisateur</DialogTitle>
        <DialogDescription>
          Le compte est immédiatement actif. Communiquez le mot de passe à la personne concernée.
        </DialogDescription>
      </DialogHeader>
      {state?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstname">Prénom</Label>
          <Input id="firstname" name="firstname" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastname">Nom</Label>
          <Input id="lastname" name="lastname" required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role">Rôle</Label>
        <Select name="role" defaultValue="architecte">
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Mot de passe temporaire</Label>
        <Input id="password" name="password" type="text" minLength={6} required />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le profil"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ResetPasswordForm({ user, onDone }: { user: AdminUserRow; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(resetUserPasswordAction, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Mot de passe réinitialisé");
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogDescription>{user.name} — {user.email}</DialogDescription>
      </DialogHeader>
      {state?.error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input id="password" name="password" type="text" minLength={6} required />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Réinitialiser"}
        </Button>
      </DialogFooter>
    </form>
  );
}
