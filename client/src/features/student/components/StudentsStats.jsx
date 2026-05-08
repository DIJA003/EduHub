import { BookOpen, PlayCircle, GraduationCap, FileUp } from "lucide-react";
import StatsCard, { StatsGrid, StatsCardSkeleton } from "../../../components/ui/StatsCard";

export default function StudentStats({ enrollments, materials, loading }) {
  if (loading) {
    return (
      <StatsGrid>
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </StatsGrid>
    );
  }

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  ).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollments.length,
      icon: BookOpen,
      color: "blue",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: PlayCircle,
      color: "amber",
    },
    {
      label: "Completed",
      value: completed,
      icon: GraduationCap,
      color: "green",
    },
    {
      label: "Materials Uploaded",
      value: materials.length,
      icon: FileUp,
      color: "purple",
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
