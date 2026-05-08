import { useMemo } from "react";
import { usePendingMaterials, useMyMaterials } from "../../materials/hooks/useMaterials";
import { useQuery } from "@tanstack/react-query";
import { mentorApi } from "../../../lib/api/mentor.api";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";

function StatCard({ label, value, icon }) {
  return (
    <div className="surface-2 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]">
          {label}
        </p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-black text-[var(--color-text)]">{value}</p>
    </div>
  );
}

export default function MentorAnalytics() {
  const { data: pendingData, isLoading: pendingLoading } = usePendingMaterials({ limit: 200 });
  const { data: materialsData, isLoading: materialsLoading } = useMyMaterials({ limit: 200 });
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => mentorApi.getStudents().then((r) => r.data?.data || []),
  });

  const pending = useMemo(
    () => (Array.isArray(pendingData) ? pendingData : pendingData?.data || []),
    [pendingData],
  );
  const myMaterials = useMemo(
    () => (Array.isArray(materialsData) ? materialsData : materialsData?.data || []),
    [materialsData],
  );
  const students = useMemo(() => studentsData || [], [studentsData]);

  const approvedCount = myMaterials.filter((m) => m.status === "approved").length;
  const rejectedCount = myMaterials.filter((m) => m.status === "rejected").length;
  const pendingOwnCount = myMaterials.filter((m) => m.status === "pending").length;

  if (pendingLoading || materialsLoading || studentsLoading) return <CardSkeleton count={4} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text)]">Mentor Analytics</h1>
        <p className="text-sm text-[var(--color-text-3)] mt-1">
          Snapshot of review throughput and learner coverage.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Queue" value={pending.length} icon="⏳" />
        <StatCard label="Approved Uploads" value={approvedCount} icon="✅" />
        <StatCard label="Rejected Uploads" value={rejectedCount} icon="❌" />
        <StatCard label="Enrolled Students" value={students.length} icon="🎓" />
      </div>
      <div className="surface p-4 sm:p-5">
        <p className="text-sm text-[var(--color-text-2)]">
          Your own pending uploads:{" "}
          <span className="font-bold text-[var(--color-text)]">{pendingOwnCount}</span>
        </p>
      </div>
    </div>
  );
}
