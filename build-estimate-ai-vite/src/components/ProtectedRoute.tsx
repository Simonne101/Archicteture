import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-70px)] items-center justify-center bg-bg-light lg:min-h-[calc(100vh-82px)]">
        <div
          role="status"
          aria-label="Chargement"
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
        />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
