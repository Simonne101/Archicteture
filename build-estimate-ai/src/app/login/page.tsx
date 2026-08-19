"use client";

import { useActionState } from "react";
import Link from "next/link";
import { HardHat, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthAside } from "@/components/marketing/auth-aside";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

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
              Connexion
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Accédez à vos projets et estimations de matériaux.
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <span
                    className="text-xs text-muted-foreground"
                    title="Les comptes sont gérés par votre administrateur, qui peut réinitialiser votre mot de passe."
                  >
                    Mot de passe oublié ? Contactez votre administrateur.
                  </span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={pending} className="mt-1 w-full gap-2">
                {pending ? "Connexion…" : "Se connecter"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </Card>

          <div className="mt-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      <AuthAside />
    </div>
  );
}
