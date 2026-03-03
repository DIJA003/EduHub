import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import DashboardHome from "./DashboardHome";
import AcademicManagement from "./AcademicManagement";
import CourseManagement from "./CourseManagement";
import MaterialsManagement from "./MaterialsManagement";
import UsersManagement from "./UsersManagement";
import "../../assets/admin.css";

function AdminDashboard() {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Navbar />
        <div className="admin-content">
          <Routes>
            <Route path="/"           element={<DashboardHome />} />
            <Route path="academics"   element={<AcademicManagement />} />
            <Route path="courses"     element={<CourseManagement />} />
            <Route path="materials"   element={<MaterialsManagement />} />
            <Route path="users"       element={<UsersManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;