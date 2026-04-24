import { useState } from "react";
import {
  useAllMaterials,
  useApproveMaterial,
  useRejectMaterial,
  useDeleteMaterial,
} from "../../materials/hooks/useMaterials";
import { usePagination } from "../../../hooks/usePagination";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { timeAgo } from "../../../lib/utils";

export default function MaterialsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [feedback, setFeedback] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useAllMaterials({
    page,
    search,
    status: statusFilter !== "all" ? statusFilter : "",
  });

  const materials = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();
  const deleteMutation = useDeleteMaterial();

  const openReview = (m, action) => {
    setReviewTarget(m);
    setReviewAction(action);
    setFeedback("");
  };

  const handleReview = () => {
    if (reviewAction === "approve") {
      approveMutation.mutate(
        { id: reviewTarget._id, feedback },
        { onSuccess: () => setReviewTarget(null) },
      );
    } else {
      rejectMutation.mutate(
        { id: reviewTarget._id, feedback },
        { onSuccess: () => setReviewTarget(null) },
      );
    }
  };

  const TYPE_ICON = {
    PDF: "📄",
    Video: "🎬",
    Slides: "📊",
    ZIP: "🗜️",
    Image: "🖼️",
    Other: "📁",
  };

  const COLUMNS = [
    {
      key: "title",
      label: "Material",
      render: (m) => (
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICON[m.type] || "📁"}</span>
          <div>
            <p className="font-medium text-slate-900 truncate max-w-xs">
              {m.title}
            </p>
            {m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
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
      render: (m) => <span className="text-xs text-slate-500">{m.type}</span>,
    },
    {
      key: "uploadedBy",
      label: "Uploaded By",
      render: (m) => (
        <span className="text-sm text-slate-600">
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
        <span className="text-xs text-slate-400">{timeAgo(m.createdAt)}</span>
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
              <Button size="xs" onClick={() => openReview(m, "approve")}>
                Approve
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => openReview(m, "reject")}
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Materials Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
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
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          emptyIcon="📂"
          emptyTitle="No materials found"
          emptyDescription="Try a different status filter."
        />
      </div>

      {/* Review Modal */}
      <Modal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={
          reviewAction === "approve"
            ? "✅ Approve Material"
            : "❌ Reject Material"
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            {reviewAction === "approve" ? (
              <Button
                onClick={handleReview}
                loading={approveMutation.isPending}
              >
                Confirm Approval
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={handleReview}
                loading={rejectMutation.isPending}
              >
                Confirm Rejection
              </Button>
            )}
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-3">
          Add feedback for the student{" "}
          <span className="font-semibold">(optional)</span>:
        </p>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            reviewAction === "approve"
              ? "Great work! Well explained…"
              : "Please revise and re-upload…"
          }
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Modal>

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
