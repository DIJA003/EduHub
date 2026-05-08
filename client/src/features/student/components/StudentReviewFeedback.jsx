import { useMemo } from "react";
import { useMyMaterials } from "../../materials/hooks/useMaterials";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import { formatDateTime } from "../../../lib/utils";

export default function StudentReviewFeedback() {
  const { data, isLoading } = useMyMaterials();
  const materials = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data],
  );

  const grouped = useMemo(
    () => ({
      pending: materials.filter((m) => m.status === "pending"),
      approved: materials.filter((m) => m.status === "approved"),
      rejected: materials.filter((m) => m.status === "rejected"),
    }),
    [materials],
  );

  if (isLoading) return <ListSkeleton rows={6} />;

  if (materials.length === 0) {
    return (
      <div className="surface">
        <EmptyState
          icon="🧾"
          title="No review items yet"
          description="Upload a material to start receiving mentor feedback."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface p-4 sm:p-5">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Review Feedback</h2>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Track approval status and mentor comments across your uploads.
        </p>
      </div>

      {["pending", "approved", "rejected"].map((status) => (
        <section key={status} className="surface p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--color-text)] capitalize">
              {status}
            </h3>
            <Badge variant={statusBadge(status)}>{grouped[status].length}</Badge>
          </div>
          {grouped[status].length === 0 ? (
            <p className="text-sm text-[var(--color-text-3)]">No items in this state.</p>
          ) : (
            <div className="space-y-3">
              {grouped[status].map((item) => (
                <article
                  key={item._id}
                  className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {item.title}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-1">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusBadge(item.status)} className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-text-2)] mt-3">
                    {item.feedback || item.reviewNote || "No mentor note provided yet."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
