import { useState } from "react";
import {
  usePendingMaterials,
  useAllMaterials,
  useApproveMaterial,
  useRejectMaterial,
} from "../../materials/hooks/useMaterials";
import { usePagination } from "../../../hooks/usePagination";
import DataTable from "../../admin/components/DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { timeAgo } from "../../../lib/utils";

export default function VideoReviews() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data, isLoading } = useAllMaterials({
    page,
    search,
    status: statusFilter !== "all" ? statusFilter : "",
  });
  const materials = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();

  const openReview = (m, action) => {
    setReviewTarget(m);
    setReviewAction(action);
    setFeedback("");
  };
  const handleReview = () => {
    const mutate =
      reviewAction === "approve" ? approveMutation : rejectMutation;
    mutate.mutate(
      { id: reviewTarget._id, feedback },
      { onSuccess: () => setReviewTarget(null) },
    );
  };

  const COLUMNS = [
    {
      key: "title",
      label: "Title",
      render: (m) => (
        <span className="font-medium text-slate-900">{m.title}</span>
      ),
    },
    {
      key: "uploadedBy",
      label: "Uploader",
      render: (m) => (
        <span className="text-sm text-slate-600">
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
        <span className="text-xs text-slate-400">{timeAgo(m.createdAt)}</span>
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
          ) : (
            <Button
              size="xs"
              variant="secondary"
              onClick={() =>
                openReview(m, m.status === "approved" ? "reject" : "approve")
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Material Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, approve, or reject student-uploaded materials.
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${statusFilter === s ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
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
        <textarea
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            reviewAction === "approve" ? "Great work!…" : "Please revise…"
          }
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </Modal>
    </>
  );
}
