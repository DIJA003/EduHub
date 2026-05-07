import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";

const PageLoader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-ink)] px-4">
    <div
      className="h-10 w-10 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] shadow-[var(--shadow-glow)] animate-spin"
      aria-hidden="true"
    />
    <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-3)]">
      Loading EduHub…
    </p>
    <span className="sr-only">Loading application</span>
  </div>
);

export function RequireAuth({ children, roles = [], requireVerified = false }) {
  const { firebaseUser, dbUser, loading } = useAuthStore();
  const role = dbUser?.role || null;

  if (loading || firebaseUser === undefined) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (requireVerified && !firebaseUser.emailVerified)
    return <Navigate to="/verify-email" replace />;
  if (!dbUser) return <PageLoader />;
  if (roles.length > 0 && !roles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "mentor") return <Navigate to="/mentor" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

export function RoleRedirect() {
  const { firebaseUser, dbUser, loading } = useAuthStore();
  const role = dbUser?.role || null;

  if (loading || firebaseUser === undefined) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/home" replace />;
  if (!dbUser) return <PageLoader />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "mentor") return <Navigate to="/mentor" replace />;
  return <Navigate to="/home" replace />;
}

export { PageLoader };
