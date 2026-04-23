import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  allowedRoles = [],
  requireVerified = false,
}) {
  const { user, dbUser, loading } = useAuth();
  const location = useLocation();

  if (loading || user === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-slate-400 text-sm">Loading…</span>
      </div>
    );

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles.length > 0) {
    if (!dbUser) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-slate-400 text-sm">Loading…</span>
        </div>
      );
    }

    const role = dbUser.role;
    if (!allowedRoles.includes(role)) {
      if (role === "admin") return <Navigate to="/admin" replace />;
      if (role === "mentor") return <Navigate to="/mentor" replace />;
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;