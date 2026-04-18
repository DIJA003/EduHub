import { useState, useEffect } from "react";
import StatsCard from "../../components/admin/StatsCard";
import {
  Badge,
  PageHeader,
  TableWrap,
  EmptyState,
  BtnPrimary,
  BtnDanger,
  tw,
} from "../../components/admin/adminUtils";
import { useAuth } from "../../context/AuthContext";
import { mentorApi } from "../../services/api";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DashboardHome() {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback modal state
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionType, setActionType] = useState("");

  useEffect(() => {
    Promise.all([mentorApi.getPendingMaterials().catch(() => null)])
      .then(([pendingRes]) => {
        const pendingItems = pendingRes?.data || [];
        setPending(
          pendingItems.map((m) => ({
            _id: m._id,
            title: m.title,
            uploader: m.uploadedByRef?.name || m.uploader || "Unknown",
            course: m.courseRef?.title || m.course || "Unknown",
            uploadedAt: m.createdAt,
          })),
        );
        setStats({
          pendingReviews: pendingItems.length,
          approved: 0,
          rejected: 0,
          students: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const openFeedback = (id, type) => {
    setFeedbackId(id);
    setActionType(type);
    setFeedbackText("");
  };

  const submitFeedback = async () => {
    try {
      if (actionType === "approve") {
        await mentorApi.approveMaterial(feedbackId, { feedback: feedbackText });
      } else {
        await mentorApi.rejectMaterial(feedbackId);
      }
      setPending((prev) => prev.filter((v) => v._id !== feedbackId));
      setStats((prev) => ({
        ...prev,
        pendingReviews: Math.max(0, prev.pendingReviews - 1),
        ...(actionType === "approve"
          ? { approved: prev.approved + 1 }
          : { rejected: prev.rejected + 1 }),
      }));
    } catch (err) {
      console.error("Review action failed:", err.message);
    }
    setFeedbackId(null);
  };

  const statCards = [
    {
      title: "Pending Reviews",
      value: loading ? "…" : String(stats?.pendingReviews ?? "—"),
      icon: "🎬",
      iconColor: "amber",
      delta: "awaiting action",
      deltaType: "up",
    },
    {
      title: "Approved Videos",
      value: loading ? "…" : String(stats?.approved ?? "—"),
      icon: "✅",
      iconColor: "green",
      delta: "total approved",
      deltaType: "up",
    },
    {
      title: "Rejected Videos",
      value: loading ? "…" : String(stats?.rejected ?? "—"),
      icon: "❌",
      iconColor: "red",
      delta: "total rejected",
      deltaType: "down",
    },
    {
      title: "My Students",
      value: loading ? "…" : String(stats?.students ?? "—"),
      icon: "🎓",
      iconColor: "blue",
      delta: "enrolled",
      deltaType: "up",
    },
  ];

  const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "Mentor";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here's what needs your attention today."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <StatsCard key={c.title} {...c} />
        ))}
      </div>

      {/* Pending reviews table */}
      <TableWrap
        toolbar={
          <>
            <h3
              className="text-[14px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Pending Video Reviews
              {!loading && pending.length > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  {pending.length}
                </span>
              )}
            </h3>
            <span
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              Review and approve or reject student uploads
            </span>
          </>
        }
      >
        {loading ? (
          <div
            className="py-12 text-center text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            Loading…
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            description="No pending videos to review right now."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                {[
                  "Video Title",
                  "Uploader",
                  "Course",
                  "Uploaded",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={tw.th}
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((v) => (
                <tr
                  key={v._id}
                  className={tw.trHover}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ color: "var(--accent-light)" }}
                      >
                        play_circle
                      </span>
                      <span className="font-medium">{v.title}</span>
                    </div>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {v.uploader}
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Badge variant="blue">{v.course}</Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {timeAgo(v.uploadedAt)}
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <BtnPrimary
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() => openFeedback(v._id, "approve")}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          check_circle
                        </span>
                        Approve
                      </BtnPrimary>
                      <BtnDanger
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() => openFeedback(v._id, "reject")}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          cancel
                        </span>
                        Reject
                      </BtnDanger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {/* Feedback Modal */}
      {feedbackId && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) => e.target === e.currentTarget && setFeedbackId(null)}
        >
          <div
            className="w-full max-w-[440px] rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-[16px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {actionType === "approve"
                  ? "✅ Approve Video"
                  : "❌ Reject Video"}
              </h3>
              <button
                onClick={() => setFeedbackId(null)}
                className="text-[20px] cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p
                className="text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Add feedback for the student{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  (optional)
                </span>
                :
              </p>
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-sm text-[13.5px] outline-none resize-none"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder={
                  actionType === "approve"
                    ? "Great work! Well explained…"
                    : "Please re-record with better audio…"
                }
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <button
                onClick={() => setFeedbackId(null)}
                className="px-4 py-2 rounded-sm text-[13.5px] font-semibold border cursor-pointer"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              {actionType === "approve" ? (
                <BtnPrimary onClick={submitFeedback}>
                  Confirm Approval
                </BtnPrimary>
              ) : (
                <BtnDanger onClick={submitFeedback}>
                  Confirm Rejection
                </BtnDanger>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
