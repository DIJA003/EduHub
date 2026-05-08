import { Navigate, Route, Routes } from "react-router-dom";
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

function StudentOverview({ enrollments, materials, enrollLoading, matLoading }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text)]">
          Student Dashboard
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1.5">
          Track your progress, submit materials, and stay aligned with your mentor.
        </p>
      </div>
      <StudentStats
        enrollments={enrollments}
        materials={materials}
        loading={enrollLoading}
      />
      <EnrolledCourses enrollments={enrollments} loading={enrollLoading} />
      <UploadMaterial enrollments={enrollments} />
      <MyMaterials materials={materials} loading={matLoading} />
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
