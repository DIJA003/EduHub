import { usePendingMaterials } from "../../materials/hooks/useMaterials";
import {
  useApproveMaterial,
  useRejectMaterial,
} from "../../materials/hooks/useMaterials";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import Modal from "../../../components/ui/Modal";
import { timeAgo } from "../../../lib/utils";

export default function MentorHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Mentor";

  const { data, isLoading } = usePendingMaterials({ limit: 10 });
  const pending = Array.isArray(data) ? data : data?.data || [];

  const approveMutation = useApproveMaterial();
  const rejectMutation = useRejectMaterial();

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState("");
  const [feedback, setFeedback] = useState("");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Reviews",
            value: pending.length,
            icon: "⏳",
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Approved Today",
            value: "—",
            icon: "✅",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Rejected Today",
            value: "—",
            icon: "❌",
            color: "bg-red-50 text-red-600",
          },
          {
            label: "My Students",
            value: "—",
            icon: "🎓",
            color: "bg-blue-50 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {s.label}
              </p>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${s.color}`}
              >
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending reviews */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Pending Material Reviews
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pending.length}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-4">
            <CardSkeleton count={3} />
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            description="No pending materials to review right now."
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Material",
                  "Uploaded By",
                  "Course",
                  "Uploaded",
                  "Actions",
                ].map((h) => (
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
              {pending.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                    {m.title}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {m.uploadedBy?.name || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{m.courseRef?.title || "—"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {timeAgo(m.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="xs"
                        onClick={() => openReview(m, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => openReview(m, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    </div>
  );
}
