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
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />

        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-7 px-8"
          style={{ background: "var(--bg-base)" }}
        >
          <Routes>
            <Route path="/"         element={<DashboardHome />}       />
            <Route path="academics" element={<AcademicManagement />}  />
            <Route path="courses"   element={<CourseManagement />}    />
            <Route path="materials" element={<MaterialsManagement />} />
            <Route path="users"     element={<UsersManagement />}     />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;