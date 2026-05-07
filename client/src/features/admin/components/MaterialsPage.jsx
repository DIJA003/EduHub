import { useState, useCallback } from "react";
import {
  useAllMaterials,
  useDeleteMaterial,
} from "../../materials/hooks/useMaterials";
import { usePagination } from "../../../hooks/usePagination";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import ReviewModal from "../../../components/common/ReviewModel";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { timeAgo } from "../../../lib/utils";

export default function MaterialsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const review = useMaterialReview();

  const { data, isLoading } = useAllMaterials({
    page,
    search,
    status: statusFilter !== "all" ? statusFilter : "",
  });
  const materials = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;
  const deleteMutation = useDeleteMaterial();

  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage],
  );

  const TYPE_ICON = {
    PDF: "📄",
    Video: "🎬",
    Slides: "📊",
    ZIP: "🗜️",
    Image: "🖼️",
    Other: "📁",
  };

  const filterBtnClass = (active) =>
    `px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold transition-colors capitalize ${
      active
        ? "bg-[var(--color-accent)] text-white"
        : "bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)]"
    }`;

  const COLUMNS = [
    {
      key: "title",
      label: "Material",
      render: (m) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICON[m.type] || "📁"}</span>
          <div>
            <p className="font-medium text-[var(--color-text)] truncate max-w-xs">
              {m.title}
            </p>
            {m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-xs)] text-[var(--color-accent)] hover:underline"
              >
                View file ↗
              </a>
            )}
          </div>
        </div>
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
      key: "type",
      label: "Type",
      render: (m) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {m.type}
        </span>
      ),
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      render: (m) => (
        <span className="text-[var(--text-sm)] text-[var(--color-text-2)]">
          {m.uploadedBy?.name || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (m) => <Badge variant={statusBadge(m.status)}>{m.status}</Badge>,
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (m) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {timeAgo(m.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "180px",
      render: (m) => (
        <div className="flex items-center gap-1.5 justify-end flex-wrap">
          {m.status === "pending" && (
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
          )}
          <Button size="xs" variant="ghost" onClick={() => setDeleteTarget(m)}>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 animate-fade-up">
        <div>
          <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
            Materials Management
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Review and manage all uploaded course materials.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={filterBtnClass(statusFilter === s)}
            >
              {s}
            </button>
          ))}
        </div>
        <DataTable
          title="All Materials"
          data={materials}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          emptyIcon="📂"
          emptyTitle="No materials found"
          emptyDescription="Try a different status filter."
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
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Material"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        onConfirm={() =>
          deleteMutation.mutate(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
