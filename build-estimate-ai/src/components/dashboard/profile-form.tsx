"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAvatarAction, updateProfileAction } from "@/actions/user";
import { initials } from "@/components/dashboard/user-context";

export function ProfileForm({
  firstname,
  lastname,
  email,
  role,
  company,
  avatarUrl,
  notifyEmail,
  notifyAnalysisDone,
}: {
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  company: string;
  avatarUrl: string | null;
  notifyEmail: boolean;
  notifyAnalysisDone: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  const [emailNotif, setEmailNotif] = useState(notifyEmail);
  const [analysisNotif, setAnalysisNotif] = useState(notifyAnalysisDone);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarPending, startAvatarTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) toast.success("Profil mis à jour");
    if (state?.error) toast.error(state.error);
  }, [state]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("avatar", file);
    startAvatarTransition(async () => {
      const result = await updateAvatarAction(fd);
      if (result.error) toast.error(result.error);
      else if (result.url) {
        setAvatar(result.url);
        toast.success("Photo de profil mise à jour");
      }
    });
  }

  return (
    <form action={formAction} className="flex w-full max-w-2xl flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Profil</CardTitle>
          <CardDescription>
            Ces informations sont visibles par les membres de votre équipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {avatar && <AvatarImage src={avatar} alt={`${firstname} ${lastname}`} />}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials(`${firstname} ${lastname}`)}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPending ? "Envoi…" : "Changer la photo"}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstname">Prénom</Label>
              <Input id="firstname" name="firstname" defaultValue={firstname} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastname">Nom</Label>
              <Input id="lastname" name="lastname" defaultValue={lastname} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" defaultValue={email} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Profession</Label>
              <Select name="role" defaultValue={role}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architecte">Architecte</SelectItem>
                  <SelectItem value="ingenieur">Ingénieur</SelectItem>
                  <SelectItem value="technicien">Technicien BTP</SelectItem>
                  <SelectItem value="conducteur">Conducteur de travaux</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="promoteur">Promoteur immobilier</SelectItem>
                  <SelectItem value="maitre_ouvrage">Maître d&apos;ouvrage</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Entreprise / Cabinet</Label>
              <Input id="company" name="company" defaultValue={company} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Notifications</CardTitle>
          <CardDescription>
            Choisissez les événements pour lesquels être notifié.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <input type="hidden" name="notifyEmail" value={emailNotif ? "on" : ""} />
          <input type="hidden" name="notifyAnalysisDone" value={analysisNotif ? "on" : ""} />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notifications par e-mail</p>
              <p className="text-xs text-muted-foreground">
                Recevoir un résumé de l&apos;activité du compte.
              </p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Fin d&apos;analyse de plan</p>
              <p className="text-xs text-muted-foreground">
                Être notifié lorsqu&apos;une analyse de plan est terminée.
              </p>
            </div>
            <Switch checked={analysisNotif} onCheckedChange={setAnalysisNotif} />
          </div>
          <p className="text-xs text-muted-foreground">
            Ces préférences sont enregistrées avec le formulaire ci-dessus. L&apos;envoi
            effectif des e-mails n&apos;est pas encore activé sur cette instance.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}
