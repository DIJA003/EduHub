import { Routes, Route, Navigate } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import MentorHome from "../components/MentorHome";
import VideoReviews from "../components/VideoReviews";
import MentorStudents from "../components/MentorStudents";
import MentorUpload from "../components/MentorUpload";

const NAV_ITEMS = [
  { to: "/mentor", icon: "📊", label: "Dashboard", end: true },
  { to: "/mentor/reviews", icon: "📋", label: "Material Reviews" },
  { to: "/mentor/students", icon: "👥", label: "My Students" },
  { to: "/mentor/upload", icon: "📎", label: "Upload Material" },
];

export default function MentorDashboard() {
  return (
    <DashboardShell navItems={NAV_ITEMS} portalTitle="Mentor Portal">
      <Routes>
        <Route index element={<MentorHome />} />
        <Route path="reviews" element={<VideoReviews />} />
        <Route path="students" element={<MentorStudents />} />
        <Route path="upload" element={<MentorUpload />} />
        <Route path="*" element={<Navigate to="/mentor" replace />} />
      </Routes>
    </DashboardShell>
  );
}
