import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/auth.store";

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
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
