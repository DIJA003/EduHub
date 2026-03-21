import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login             from "../pages/Login";
import ForgotPassword    from "../pages/ForgotPassword";
import Register          from "../pages/Register";
import Home              from "../pages/Home";
import AcademicYear      from "../pages/AcademicYear";
import YearDetail        from "../pages/YearDetail";
import DataScienceCourses from "../pages/DataScienceCourses";
import StudentProfile   from "../pages/Studentprofile";
import StudentDashboard  from "../pages/StudentDashboard";
import AdminDashboard    from "../pages/admin/AdminDashboard";
import MentorDashboard   from "../pages/mentor/MentorDashboard";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/"                    element={<Navigate to="/home" replace />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"            element={<Register />} />
        <Route path="/forgotpassword"      element={<ForgotPassword />} />
        <Route path="/home"                element={<Home />} />
        <Route path="/academic-year"       element={<AcademicYear />} />
        <Route path="/academic-year/:yearId" element={<YearDetail />} />
        <Route path="/data-science"        element={<DataScienceCourses />} />
        <Route path="/profile"             element={<StudentProfile />} />
        <Route path="/std-dashboard"       element={<StudentDashboard />} />
        <Route path="/admin/*"             element={<AdminDashboard />} />
        <Route path="/mentor/*"            element={<MentorDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;