import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login              from '../pages/auth/Login';
import ForgotPassword     from '../pages/auth/ForgotPassword';
import Register           from '../pages/auth/Register';
import Home               from '../pages/Home';
import AcademicYear       from '../pages/AcademicYear';
import AdminDashboard     from '../pages/admin/AdminDashboard';
import EmailVerification  from '../pages/auth/EmailVerification';
import ChangePassword     from '../pages/auth/ChangePassword';
import ProtectedRoute     from '../components/ProtectedRoute';

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