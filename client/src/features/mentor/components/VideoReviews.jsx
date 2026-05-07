import { useState } from "react";
import { useAllMaterials } from "../../materials/hooks/useMaterials";
import { usePagination } from "../../../hooks/usePagination";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import ReviewModal from "../../../components/common/ReviewModel";
import DataTable from "../../../components/ui/DataTable";
import PageHeader from "../../../components/ui/PageHeader";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import { timeAgo } from "../../../lib/utils";

export default function VideoReviews() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const review = useMaterialReview();

  const { data, isLoading } = useAllMaterials({
    page,
    search,
    status: statusFilter !== "all" ? statusFilter : "",
  });
  const materials = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const COLUMNS = [
    {
      key: "title",
      label: "Title",
      render: (m) => (
        <span className="font-medium text-[var(--color-text)]">{m.title}</span>
      ),
    },
    {
      key: "uploadedBy",
      label: "Uploader",
      render: (m) => (
        <span className="text-[var(--text-sm)] text-[var(--color-text-2)]">
          {m.uploadedBy?.name || "—"}
        </span>
      ),
    },
    {
      key: "courseRef",
      label: "Course",
      render: (m) =>
        m.courseRef?.title ? (
          <Badge variant="blue">{m.courseRef.title}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (m) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)] tabular-nums">{timeAgo(m.createdAt)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (m) => <Badge variant={statusBadge(m.status)}>{m.status}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      width: "180px",
      render: (m) => (
        <div className="flex items-center gap-1.5 justify-end">
          {m.status === "pending" ? (
            <>
              <Button size="xs" onClick={() => review.openReview(m, "approve")}>
                Approve
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => review.openReview(m, "reject")}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="xs"
              variant="secondary"
              onClick={() =>
                review.openReview(
                  m,
                  m.status === "approved" ? "reject" : "approve",
                )
              }
            >
              Change
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
      <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mentor"
          title="Material Reviews"
          description="Review, approve, or reject student-uploaded materials."
        />

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`rounded-[var(--radius-lg)] px-3 py-1.5 text-[var(--text-xs)] font-semibold capitalize transition-all duration-[var(--duration-fast)] ${
                statusFilter === s
                  ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)]"
                  : "border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 text-[var(--color-text-2)] backdrop-blur-sm hover:border-[var(--color-border-2)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <DataTable
          title="Materials"
          data={materials}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          emptyIcon="📋"
          emptyTitle="No materials found"
        />
      </div>

      <ReviewModal
        open={!!review.reviewTarget}
        action={review.reviewAction}
        feedback={review.feedback}
        onFeedbackChange={review.setFeedback}
        onConfirm={review.submitReview}
        onCancel={review.closeReview}
        loading={review.isLoading}
      />
    </>
  );
}
