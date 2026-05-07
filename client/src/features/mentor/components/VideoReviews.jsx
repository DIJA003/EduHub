import { useState } from "react";
import { useAllMaterials } from "../../materials/hooks/useMaterials";
import { usePagination } from "../../../hooks/usePagination";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import ReviewModal from "../../../components/common/ReviewModel";
import DataTable from "../../admin/components/DataTable";
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
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
