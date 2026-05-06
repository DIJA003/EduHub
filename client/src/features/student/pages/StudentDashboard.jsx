import { useState } from "react";
import DashboardShell from "../../../components/layout/DashboardShell";
import StudentStats from "../components/StudentStats";
import EnrolledCourses from "../components/EnrolledCourses";
import UploadMaterial from "../components/UploadMaterial";
import MyMaterials from "../components/MyMaterials";
import { useMyEnrollments } from "../../enrollment/hooks/useEnrollments";
import { useMyMaterials } from "../../materials/hooks/useMaterials";

const NAV_ITEMS = [
  { to: "/std-dashboard", icon: "📊", label: "Dashboard", end: true },
  { to: "/std-dashboard/courses", icon: "📚", label: "My Courses" },
  { to: "/std-dashboard/upload", icon: "📎", label: "Upload Material" },
  { to: "/std-dashboard/materials", icon: "📋", label: "My Materials" },
];

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
    <DashboardShell navItems={NAV_ITEMS} portalTitle="Student Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your studies.
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
    </DashboardShell>
  );
}
