import { useQuery } from "@tanstack/react-query";
import { mentorApi } from "../../../lib/api/mentor.api";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Badge from "../../../components/ui/Badges";
import { formatDate, initials } from "../../../lib/utils";

export default function MentorStudents() {
  const { data, isLoading } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => mentorApi.getStudents().then((r) => r.data?.data || []),
  });

  const students = data || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text)]">My Students</h1>
        <p className="text-sm text-[var(--color-text-3)] mt-1">
          Students enrolled in your courses.
        </p>
      </div>

      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <span className="text-sm font-bold text-[var(--color-text)]">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : students.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="No students yet"
            description="Students enrolled in your courses will appear here."
          />
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {["Student", "Email", "Course", "Enrolled"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {students.map((s, i) => (
                <tr
                  key={s._id || i}
                  className="hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                        {initials(s.name)}
                      </div>
                      <span className="font-medium text-[var(--color-text)]">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--color-text-3)]">
                    {s.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{s.course}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[var(--color-text-3)]">
                    {formatDate(s.enrolledAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
