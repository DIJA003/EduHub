import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login          from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Register       from "../pages/Register";
import Home           from "../pages/Home";
import AcademicYear   from "../pages/AcademicYear";
import AdminDashboard  from "../pages/admin/AdminDashboard";
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
      <AuthProvider>
        <Routes>
          {/* Root  */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Public */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Student */}
          <Route path="/home"           element={<Home />} />
          <Route path="/academic-year"  element={<AcademicYear />} />

          {/* Admin */}
          <Route path="/admin/*"  element={<AdminDashboard />} />

          {/* Mentor */}
          <Route path="/mentor/*" element={<MentorDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRoutes;