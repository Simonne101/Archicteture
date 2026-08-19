"use client";

import { useActionState } from "react";
import Link from "next/link";
import { HardHat, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthAside } from "@/components/marketing/auth-aside";
import { signupAction } from "@/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HardHat className="size-4.5" />
            </div>
            <span className="font-heading text-base font-semibold">
              BuildEstimate AI
            </span>
          </Link>

          <div className="mt-10">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Créer un compte
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Rejoignez les professionnels qui utilisent BuildEstimate AI.
            </p>
          </div>

          <Card className="mt-8 gap-5 p-6">
            <form className="flex flex-col gap-4" action={formAction}>
              {state?.error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {state.error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstname">Prénom</Label>
                  <Input id="firstname" name="firstname" placeholder="Aïcha" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastname">Nom</Label>
                  <Input id="lastname" name="lastname" placeholder="Koné" required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Adresse e-mail professionnelle</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">Profession</Label>
                <Select name="role" defaultValue="architecte">
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Sélectionnez votre profession" />
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
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
              </div>
              <Button type="submit" disabled={pending} className="mt-1 w-full gap-2">
                {pending ? "Création…" : "Créer mon compte"}
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                En créant un compte, vous acceptez nos conditions
                d&apos;utilisation et notre politique de confidentialité.
              </p>
            </form>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <AuthAside />
    </div>
  );
}
