import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api/client";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Badge from "../../../components/ui/Badges";
import { formatDate, initials } from "../../../lib/utils";

export default function MentorStudents() {
  const { data, isLoading } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () =>
      api.get("/enrollments?limit=100").then((r) =>
        (r.data?.data || []).map((e) => ({
          _id: e.student?._id,
          name: e.student?.name || "—",
          email: e.student?.email || "—",
          course: e.course?.title || "—",
          enrolledAt: e.enrolledAt,
        })),
      ),
  });

  const students = data || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          Students enrolled in your courses.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <span className="text-sm font-bold text-slate-900">
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
            <thead className="bg-slate-50">
              <tr>
                {["Student", "Email", "Course", "Enrolled"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, i) => (
                <tr
                  key={s._id || i}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {initials(s.name)}
                      </div>
                      <span className="font-medium text-slate-900">
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {s.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{s.course}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
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
