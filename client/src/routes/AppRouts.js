import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Register from "../pages/Register";
import Home from "../pages/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AcademicYear from "../pages/AcademicYear";
function AppRoutes() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/academic-year" element={<Home/>}/>

            <Route path="/admin/*" element={<AdminDashboard/>}/>
          </Routes>
        </Router>
  );
}

export default AppRoutes;