import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";
import { ROLE_HOME } from "../constants/navigation";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--color-ink)] transition-colors duration-300">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
