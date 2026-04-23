import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/mentor/Sidebar";
import Navbar from "../../components/mentor/Navbar";
import DashboardHome from "./DashboardHome";
import VideoReviews from "./VideoReviews";
import Students from "./Students";
import UploadMaterial from "./UploadMaterial";
import MentorProfile from "./MentorProfile";
import "../../assets/admin.css"; // reuse the same design-system CSS
import MentorHistory from "./MentorHistory";

import EnrollStudents from "./EnrollStudents";

function MentorDashboard() {
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
            <Route index element={<DashboardHome />} />
            <Route path="reviews" element={<VideoReviews />} />
            <Route path="students" element={<Students />} />
            <Route path="enroll" element={<EnrollStudents />} />
            <Route path="upload" element={<UploadMaterial />} />
            <Route path="history" element={<MentorHistory />} />
            <Route path="profile" element={<MentorProfile />} />
            <Route path="*" element={<Navigate to="/mentor" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;