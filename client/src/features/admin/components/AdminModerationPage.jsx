import { useCallback, useState } from "react";
import { usePagination } from "../../../hooks/usePagination";
import { useAllMaterials } from "../../materials/hooks/useMaterials";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import DataTable from "./DataTable";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import ReviewModal from "../../../components/common/ReviewModel";
import MaterialViewer from "../../../components/common/MaterialViewer";
import { timeAgo } from "../../../lib/utils";

export default function AdminModerationPage() {
  const { page, setPage } = usePagination();
  const [viewMaterial, setViewMaterial] = useState(null);
  const review = useMaterialReview();

  const { data, isLoading } = useAllMaterials({
    page,
    status: "pending",
  });

  const materials = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const closeReview = useCallback(() => review.closeReview(), [review]);

  const handleConfirmReview = useCallback(() => review.submitReview(), [review]);

  const columns = [
    {
      key: "title",
      label: "Material",
      render: (m) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{m.title}</p>
          {m.fileUrl ? (
            <button
              onClick={() => setViewMaterial(m)}
              className="text-xs text-[var(--color-accent)] hover:underline"
            >
              Preview file
            </button>
          ) : null}
        </div>
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
      render: (m) => (
        <Badge variant="blue">{m.courseRef?.title || "Unassigned"}</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (m) => (
        <span className="text-xs text-[var(--color-text-3)]">{timeAgo(m.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "170px",
      render: (m) => (
        <div className="flex items-center gap-2 justify-end">
          <Button size="xs" onClick={() => review.openReview(m, "approve")}>
            Approve
          </Button>
          <Button size="xs" variant="danger" onClick={() => review.openReview(m, "reject")}>
            Reject
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
            Moderation Queue
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Review pending uploads and enforce content quality.
          </p>
        </div>
        <DataTable
          title="Pending Materials"
          data={materials}
          columns={columns}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          emptyIcon="🛡️"
          emptyTitle="Queue is clear"
          emptyDescription="No materials require moderation right now."
        />
      </div>

      <ReviewModal
        open={!!review.reviewTarget}
        action={review.reviewAction}
        feedback={review.feedback}
        onFeedbackChange={review.setFeedback}
        onConfirm={handleConfirmReview}
        onCancel={closeReview}
        loading={review.isLoading}
      />
      <MaterialViewer material={viewMaterial} onClose={() => setViewMaterial(null)} />
    </>
  );
}
