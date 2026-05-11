import { BookOpen, FileUp, School, Layers } from "lucide-react";
import StatsCard, { StatsGrid, StatsCardSkeleton } from "../../../components/ui/StatsCard";
import useAuthStore from "../../../stores/auth.store";

export default function StudentStats({ enrollments, materials, loading }) {
  const dbUser = useAuthStore((s) => s.dbUser);

  if (loading) {
    return (
      <StatsGrid>
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </StatsGrid>
    );
  }

  const pendingReview = materials.filter((m) => m.status === "pending").length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollments.length,
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "Materials Uploaded",
      value: materials.length,
      icon: FileUp,
      color: "purple",
    },
    {
      label: "Pending Review",
      value: pendingReview,
      icon: Layers,
      color: "amber",
    },
    {
      label: dbUser?.year ? `Year ${dbUser.year}` : "Academic Year",
      value: dbUser?.semester ? (() => {
        const names = { 1: "Fall", 2: "Spring", 3: "Summer" };
        return names[dbUser.semester] || `Sem ${dbUser.semester}`;
      })() : "-",
      icon: School,
      color: "green",
    },
  ];

  return (
    <StatsGrid>
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}
    </StatsGrid>
  );
}
