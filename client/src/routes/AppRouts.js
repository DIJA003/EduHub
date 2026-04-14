<<<<<<< Updated upstream
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Register from "../pages/auth/Register";
import Home from "../pages/Home";
import AcademicYear from "../pages/AcademicYear";
import AdminDashboard from "../pages/admin/AdminDashboard";
import EmailVerification from "../pages/auth/EmailVerification";
import ChangePassword from "../pages/auth/ChangePassword";
import ProtectedRoute from "../components/ProtectedRoute";
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login              from '../pages/auth/Login';
import ForgotPassword     from '../pages/auth/ForgotPassword';
import Register           from '../pages/auth/Register';
import Home               from '../pages/Home';
import AcademicYear       from '../pages/AcademicYear';
import YearDetail         from '../pages/YearDetail';
import DataScienceCourses from '../pages/DataScienceCourses';
import StudentDashboard   from '../pages/StudentDashboard';
import AdminDashboard     from '../pages/admin/AdminDashboard';
import MentorDashboard    from '../pages/mentor/MentorDashboard';
import EmailVerification  from '../pages/auth/EmailVerification';
import ChangePassword     from '../pages/auth/ChangePassword';
import ProtectedRoute     from '../components/ProtectedRoute';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RoleRedirect() {
  const { dbUser, user } = useAuth();
  if (user === undefined) return null;
  if (!user)             return <Navigate to="/login"  replace />;
  if (dbUser?.role === 'admin')  return <Navigate to="/admin"  replace />;
  if (dbUser?.role === 'mentor') return <Navigate to="/mentor" replace />;
  return <Navigate to="/home" replace />;
}
>>>>>>> Stashed changes

function AppRoutes() {
  return (
    <Router>
      <Routes>
<<<<<<< Updated upstream
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
=======
        <Route path="/" element={<RoleRedirect />} />

        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
>>>>>>> Stashed changes
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

<<<<<<< Updated upstream
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
            <ProtectedRoute allowedRoles={["admin"]} requireVerified>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
=======
        <Route path="/change-password" element={
          <ProtectedRoute><ChangePassword /></ProtectedRoute>
        } />

        <Route path="/home" element={
          <ProtectedRoute requireVerified><Home /></ProtectedRoute>
        } />
        <Route path="/academic-year" element={
          <ProtectedRoute requireVerified><AcademicYear /></ProtectedRoute>
        } />
        <Route path="/academic-year/:yearId" element={
          <ProtectedRoute requireVerified><YearDetail /></ProtectedRoute>
        } />
        <Route path="/data-science-courses" element={
          <ProtectedRoute requireVerified><DataScienceCourses /></ProtectedRoute>
        } />
        <Route path="/std-dashboard" element={
          <ProtectedRoute requireVerified><StudentDashboard /></ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']} requireVerified>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/mentor/*" element={
          <ProtectedRoute allowedRoles={['mentor']} requireVerified>
            <MentorDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
}

export default AppRoutes;
