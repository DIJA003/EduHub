import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
/*
    astkhdmha ezay 
    <ProtectedRoute> for any login
    <ProtectedRoute allowedRoles={['admin']}> for admin bss
    <ProtectedRoute allowedRoles={['stduent', 'mentor']}> for std and ment roles
    .... w hakza
*/
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { loading, user, dbUser } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = dbUser?.role;
    if (!allowedRoles.includes(role)) {
      // Redirect to their correct home
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;