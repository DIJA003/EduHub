import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnenroll } from "../../enrollment/hooks/useEnrollments";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";

export default function EnrolledCourses({ enrollments, loading }) {
  const navigate = useNavigate();
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const unenrollMutation = useUnenroll();

  if (loading) return <TableSkeleton rows={3} cols={5} />;

  return (
    <>
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            My Courses ({enrollments.length})
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/academic-year")}
          >
            Browse Courses
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No courses enrolled"
            description="Browse available courses to get started."
            action={() => navigate("/academic-year")}
            actionLabel="Browse Courses"
          />
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {["Course", "Code", "Progress", "Next Up", ""].map((h) => (
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
              {enrollments.map((e) => (
                <tr
                  key={e.enrollmentId || e.courseId}
                  className="hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <button
                      className="font-medium text-[var(--color-accent)] hover:underline text-left"
                      onClick={() =>
                        navigate(
                          `/academic-year/${e.yearId}/course/${e.courseId}`,
                        )
                      }
                    >
                      {e.name}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{e.code}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden min-w-[60px]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)] transition-[width]"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono ${
                          e.progress >= 100
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-text-3)]"
                        }`}
                      >
                        {e.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[var(--color-text-3)]">
                    {e.progress >= 100 ? "✓ Completed" : e.nextItem}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() =>
                          navigate(
                            `/academic-year/${e.yearId}/course/${e.courseId}`,
                          )
                        }
                      >
                        Open
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => setUnenrollTarget(e)}
                      >
                        Unenroll
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!unenrollTarget}
        title="Unenroll from course?"
        message={`Remove enrollment from "${unenrollTarget?.name}"?`}
        confirmLabel="Unenroll"
        onConfirm={() =>
          unenrollMutation.mutate(unenrollTarget.courseId, {
            onSuccess: () => setUnenrollTarget(null),
          })
        }
        onCancel={() => setUnenrollTarget(null)}
        loading={unenrollMutation.isPending}
      />
    </>
  );
}
