import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login     from '../pages/auth/Login';
import ForgotPassword     from '../pages/auth/ForgotPassword';
import Register     from '../pages/auth/Register';
import Home     from '../pages/Home';
import AcademicYear     from '../pages/AcademicYear';
import YearDetail from "../pages/YearDetail";
import DataScienceCourses from "../pages/DataScienceCourses";
import StudentDashboard from "../pages/StudentDashboard";
import AdminDashboard      from '../pages/admin/AdminDashboard';
import EmailVerification  from '../pages/auth/EmailVerification';
import ChangePassword     from '../pages/auth/ChangePassword';
import ProtectedRoute     from '../components/ProtectedRoute';
import MentorDashboard from "../pages/mentor/MentorDashboard";
import { AuthProvider, useAuth } from "../context/AuthContext";

// ── Guard: redirect based on role ────────────────────────────────────────────
function RoleRedirect() {
  const { dbUser, user } = useAuth();
  // Still loading Firebase auth
  if (user === undefined) return null;
  // Not logged in
  if (!user) return <Navigate to="/login" replace />;
  // Logged in → route by role
  if (dbUser?.role === "admin")  return <Navigate to="/admin"  replace />;
  if (dbUser?.role === "mentor") return <Navigate to="/mentor" replace />;
  return <Navigate to="/home" replace />;
}

function AppRoutes() {
  return (  
    <Router>
      <Routes>
        <Route path="/"               element={<Navigate to="/home" replace />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-email"   element={<EmailVerification />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute requireVerified>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic-year"
          element={
            <ProtectedRoute requireVerified>
              <AcademicYear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']} requireVerified>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppRoutes;