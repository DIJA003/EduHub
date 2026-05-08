import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Upload } from "lucide-react";
import DashboardShell from "../../../components/layout/DashboardShell";
import StudentStats from "../components/StudentsStats";
import EnrolledCourses from "../components/EnrolledCourses";
import UploadMaterial from "../components/UploadMaterial";
import MyMaterials from "../components/MyMaterials";
import StudentNotificationCenter from "../components/StudentNotificationCenter";
import StudentActivityTimeline from "../components/StudentActivityTimeline";
import StudentReviewFeedback from "../components/StudentReviewFeedback";
import { useMyEnrollments } from "../../enrollment/hooks/useEnrollments";
import { useMyMaterials } from "../../materials/hooks/useMaterials";
import { NAV_BY_ROLE } from "../../../constants/navigation";
import useAuthStore from "../../../stores/auth.store";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";

function WelcomeSection({ name }) {
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 sm:p-8 bg-gradient-to-br from-[var(--color-accent)] via-[var(--color-accent)] to-[#4fc3f7]"
    >
      {/* Background decorative elements */}
      <div
  className="absolute inset-0 opacity-50"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }}
/>
      <div className="relative z-10">
        <p className="text-white/70 text-[var(--text-sm)] font-medium mb-1">
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {name || "Student"}
        </h1>
        <p className="text-white/80 text-[var(--text-sm)] max-w-lg mb-6">
          Track your learning progress, submit materials, and stay connected with your mentors.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/academic-year")}
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/30"
          >
            Browse Courses
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/student/upload")}
            leftIcon={<Upload className="w-4 h-4" />}
            className="bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/30"
          >
            Upload Material
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-start gap-4 p-5 text-left w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-[var(--duration-normal)]"
    >
      <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] mb-0.5">
          {title}
        </h3>
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {description}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--color-text-3)] shrink-0 mt-1" strokeWidth={2} />
    </motion.button>
  );
}

function StudentOverview({ enrollments, materials, enrollLoading, matLoading }) {
  const dbUser = useAuthStore((s) => s.dbUser);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <WelcomeSection name={dbUser?.name} />
      
      <StudentStats
        enrollments={enrollments}
        materials={materials}
        loading={enrollLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EnrolledCourses enrollments={enrollments} loading={enrollLoading} />
          <MyMaterials materials={materials} loading={matLoading} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)] uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <QuickActionCard
              icon={BookOpen}
              title="Browse Courses"
              description="Explore available courses"
              onClick={() => navigate("/academic-year")}
            />
            <QuickActionCard
              icon={Upload}
              title="Upload Material"
              description="Submit your work for review"
              onClick={() => navigate("/student/upload")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { data: enrollmentsData, isLoading: enrollLoading } =
    useMyEnrollments();
  const { data: materialsData, isLoading: matLoading } = useMyMaterials();

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];
  const materials = Array.isArray(materialsData)
    ? materialsData
    : materialsData?.data || [];

  return (
    <DashboardShell navItems={NAV_BY_ROLE.student} portalTitle="Student Portal">
      <Routes>
        <Route
          index
          element={
            <StudentOverview
              enrollments={enrollments}
              materials={materials}
              enrollLoading={enrollLoading}
              matLoading={matLoading}
            />
          }
        />
        <Route
          path="courses"
          element={<EnrolledCourses enrollments={enrollments} loading={enrollLoading} />}
        />
        <Route path="upload" element={<UploadMaterial enrollments={enrollments} />} />
        <Route
          path="notifications"
          element={<StudentNotificationCenter />}
        />
        <Route path="logs" element={<StudentActivityTimeline />} />
        <Route path="reviews" element={<StudentReviewFeedback />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </DashboardShell>
  );
}
