import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Register from "../pages/auth/Register";
import EmailVerification from "../pages/auth/EmailVerification";
import ChangePassword from "../pages/auth/ChangePassword";

import Home from "../pages/Home";
import AcademicYear from "../pages/AcademicYear";
import YearDetail from "../pages/YearDetail";
import DataScienceCourses from "../pages/DataScienceCourses";
import StudentDashboard from "../pages/StudentDashboard";

import AdminDashboard from "../pages/admin/AdminDashboard";
import MentorDashboard from "../pages/mentor/MentorDashboard";

import ProtectedRoute from "../components/ProtectedRoute";

function RoleRedirect() {
  const { user, dbUser, loading } = useAuth();
  if (loading || user === undefined) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (dbUser?.role === "admin") return <Navigate to="/admin" replace />;
  if (dbUser?.role === "mentor") return <Navigate to="/mentor" replace />;
  return <Navigate to="/home" replace />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

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
          path="/academic-year/:yearId"
          element={
            <ProtectedRoute requireVerified>
              <YearDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-science-courses"
          element={
            <ProtectedRoute requireVerified>
              <DataScienceCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/std-dashboard"
          element={
            <ProtectedRoute requireVerified allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]} requireVerified>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/*"
          element={
            <ProtectedRoute allowedRoles={["mentor"]} requireVerified>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
