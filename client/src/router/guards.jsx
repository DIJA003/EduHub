import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
import { ROLE_HOME } from "../constants/navigation";
import { ThemeToggleFixedCorner } from "../components/common/ThemeToggle";

const PageLoader = () => (
  <div className="relative flex min-h-screen items-center justify-center bg-[var(--color-ink)] transition-colors duration-300">
    <ThemeToggleFixedCorner />
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
  </div>
);

export function RequireAuth({ children, roles = [], requireVerified = false }) {
  const { firebaseUser, dbUser, loading } = useAuthStore();
  const role = dbUser?.role || null;

  if (loading || firebaseUser === undefined) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (requireVerified && !firebaseUser.emailVerified)
    return <Navigate to="/verify-email" replace />;
  if (!dbUser) return <Navigate to="/home?auth=sync-required" replace />;
  if (roles.length > 0 && !roles.includes(role)) {
    if (ROLE_HOME[role]) return <Navigate to={ROLE_HOME[role]} replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

export function RoleRedirect() {
  const { firebaseUser, dbUser, loading } = useAuthStore();
  const role = dbUser?.role || null;

  if (loading || firebaseUser === undefined) return <PageLoader />;
  if (!firebaseUser) return <Navigate to="/home" replace />;
  if (!dbUser) return <Navigate to="/home?auth=sync-required" replace />;
  return <Navigate to={ROLE_HOME[role] || "/student"} replace />;
}

export function RequireGuest({ children }) {
  const { firebaseUser, dbUser, loading } = useAuthStore();
  const role = dbUser?.role || null;

  if (loading || firebaseUser === undefined) return <PageLoader />;
  if (firebaseUser && dbUser) {
    return <Navigate to={ROLE_HOME[role] || "/student"} replace />;
  }
  return children;
}

export { PageLoader };
