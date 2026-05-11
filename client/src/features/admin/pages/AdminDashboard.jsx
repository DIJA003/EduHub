import { Routes, Route, Navigate } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import { NAV_BY_ROLE } from "../../../constants/navigation";
import AdminHome from "../components/AdminHome";
import UsersPage from "../components/UsersPage";
import CoursesPage from "../components/CoursesPage";
import MaterialsPage from "../components/MaterialsPage";
import EnrollmentsPage from "../components/EnrollmentsPage";
import FacultiesPage from "../components/FacultiesPage";
import ProgramsPage from "../components/ProgramsPage";
import LogsPage from "../components/LogsPage";
import AdminModerationPage from "../components/AdminModerationPage";
import AdminAnalyticsPage from "../components/AdminAnalyticsPage";
import AdminSettingsPage from "../components/AdminSettingsPage";
import AdminNotificationsPage from "../components/AdminNotificationsPage";
import RequestsPage from "../components/RequestsPage";

export default function AdminDashboard() {
  return (
    <DashboardShell navItems={NAV_BY_ROLE.admin} portalTitle="Admin Portal">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="faculties" element={<FacultiesPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DashboardShell>
  );
}
