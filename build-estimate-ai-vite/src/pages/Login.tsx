import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { buttonClasses } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/projects";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light px-5 py-16 md:min-h-[calc(100vh-82px)]">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-surface p-8 shadow-[0_14px_34px_rgba(3,18,38,0.08)]">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-dark/60 hover:text-text-dark">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>

        <h1 className="mb-1 text-2xl font-extrabold text-text-dark">Connexion</h1>
        <p className="mb-6 text-sm text-text-dark/60">
          Accédez à votre espace Build Estimate AI.
        </p>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-dark">
            Adresse e-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-lg border border-black/10 px-3.5 text-sm font-normal outline-none focus:border-primary"
              placeholder="vous@entreprise.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-text-dark">
            Mot de passe
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border border-black/10 px-3.5 text-sm font-normal outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonClasses("primary", "mt-2 h-12 w-full disabled:opacity-60 disabled:cursor-not-allowed")}
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-dark/60">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
