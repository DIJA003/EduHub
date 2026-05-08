import { Routes, Route, Navigate } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import { NAV_BY_ROLE } from "../../../constants/navigation";
import MentorHome from "../components/MentorHome";
import VideoReviews from "../components/VideoReviews";
import MentorStudents from "../components/MentorStudents";
import MentorUpload from "../components/MentorUpload";
import MentorNotifications from "../components/MentorNotifications";
import MentorAnalytics from "../components/MentorAnalytics";
import MentorLogs from "../components/MentorLogs";

export default function MentorDashboard() {
  return (
    <DashboardShell navItems={NAV_BY_ROLE.mentor} portalTitle="Mentor Portal">
      <Routes>
        <Route index element={<MentorHome />} />
        <Route path="reviews" element={<VideoReviews />} />
        <Route path="students" element={<MentorStudents />} />
        <Route path="upload" element={<MentorUpload />} />
        <Route path="courses" element={<MentorStudents />} />
        <Route path="uploads" element={<VideoReviews />} />
        <Route path="notifications" element={<MentorNotifications />} />
        <Route path="analytics" element={<MentorAnalytics />} />
        <Route path="logs" element={<MentorLogs />} />
        <Route path="*" element={<Navigate to="/mentor" replace />} />
      </Routes>
    </DashboardShell>
  );
}
