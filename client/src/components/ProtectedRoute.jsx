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
  const { user, dbUser } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const role = dbUser?.role;
    if (!allowedRoles.includes(role)) {
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/home" replace />;
    }
  }
  return children;
}

export default ProtectedRoute;