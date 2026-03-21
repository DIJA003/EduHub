import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Usage examples:
 *   <ProtectedRoute>                                   → any logged-in user
 *   <ProtectedRoute requireVerified>                   → logged-in + email verified
 *   <ProtectedRoute allowedRoles={['admin']}>          → admin only
 *   <ProtectedRoute allowedRoles={['student','mentor']} requireVerified>
 */

function ProtectedRoute({ children, allowedRoles = [], requireVerified = false }) {
  const auth = useAuth();
  const location = useLocation();

  // If AuthProvider is missing, fail safe by sending to login
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { user, dbUser } = auth;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = dbUser?.role;
    if (!role) {
      return null;
    }
    if (!allowedRoles.includes(role)) {
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;