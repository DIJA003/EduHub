import { Routes, Route, Navigate } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import AdminHome from "../components/AdminHome";
import UsersPage from "../components/UsersPage";
import CoursesPage from "../components/CoursesPage";
import MaterialsPage from "../components/MaterialsPage";
import EnrollmentsPage from "../components/EnrollmentsPage";
import CollegesPage from "../components/CollegesPage";
import LogsPage from "../components/LogsPage";

const NAV_ITEMS = [
  { to: "/admin", icon: "📊", label: "Dashboard", end: true },
  { to: "/admin/colleges", icon: "🏫", label: "Colleges" },
  { to: "/admin/courses", icon: "📚", label: "Courses" },
  { to: "/admin/materials", icon: "📎", label: "Materials" },
  { to: "/admin/users", icon: "👥", label: "Users" },
  { to: "/admin/enrollments", icon: "🎓", label: "Enrollments" },
  { to: "/admin/logs", icon: "📋", label: "History Logs" },
];

export default function AdminDashboard() {
  return (
    <DashboardShell navItems={NAV_ITEMS} portalTitle="Admin Portal">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="colleges" element={<CollegesPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardShell>
  );
}
