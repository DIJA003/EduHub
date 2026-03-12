import { useState } from "react";
import { Badge, PageHeader, TableWrap, TableSearch, EmptyState, BtnPrimary, BtnDanger, BtnSecondary, tw } from "../../components/admin/adminUtils";

const MOCK = [
  { _id: "1", title: "Intro to Linked Lists",  uploader: "Ahmed Samy",   course: "Data Structures", status: "Pending",  uploadedAt: "2025-03-10T10:00:00Z" },
  { _id: "2", title: "CSS Flexbox Deep Dive",  uploader: "Nour Tarek",   course: "Web Dev",         status: "Pending",  uploadedAt: "2025-03-11T08:30:00Z" },
  { _id: "3", title: "Binary Trees Explained", uploader: "Omar Khalid",  course: "Algorithms",      status: "Approved", uploadedAt: "2025-03-09T14:00:00Z" },
  { _id: "4", title: "React Hooks Tutorial",   uploader: "Layla Hassan", course: "Web Dev",         status: "Approved", uploadedAt: "2025-03-08T09:15:00Z" },
  { _id: "5", title: "SQL Joins Crash Course", uploader: "Karim Ali",    course: "Databases",       status: "Rejected", uploadedAt: "2025-03-07T11:45:00Z" },
  { _id: "6", title: "OOP in Python",          uploader: "Sara Mostafa", course: "Programming",     status: "Pending",  uploadedAt: "2025-03-12T07:00:00Z" },
];

const STATUS_VARIANT = { Pending: "warning", Approved: "success", Rejected: "danger" };

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function VideoReviews() {
  const [videos,       setVideos]       = useState(MOCK);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feedbackId,   setFeedbackId]   = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionType,   setActionType]   = useState("");

  const filtered = videos.filter((v) =>
    (v.title.toLowerCase().includes(search.toLowerCase()) ||
     v.uploader.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "All" || v.status === statusFilter)
  );

  const openFeedback = (id, type) => { setFeedbackId(id); setActionType(type); setFeedbackText(""); };

  const submitFeedback = () => {
    const newStatus = actionType === "approve" ? "Approved" : "Rejected";
    setVideos((prev) => prev.map((v) => v._id === feedbackId ? { ...v, status: newStatus } : v));
    setFeedbackId(null);
  };

  const FILTER_BTNS = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Reviews"
        subtitle="Review, approve, or reject student-uploaded videos."
      />

      <TableWrap
        toolbar={
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {FILTER_BTNS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer"
                  style={
                    statusFilter === f
                      ? { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" }
                      : { background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <TableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or uploader…"
            />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="🎬" title="No videos found" description="Try adjusting your search or filter." />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                {["Title", "Uploader", "Course", "Uploaded", "Status", "Actions"].map((h) => (
                  <th key={h} className={tw.th} style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v._id}
                  className={tw.trHover}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className={tw.td} style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--accent-light)" }}>play_circle</span>
                      <span className="font-medium">{v.title}</span>
                    </div>
                  </td>
                  <td className={tw.td} style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>{v.uploader}</td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}><Badge variant="blue">{v.course}</Badge></td>
                  <td className={tw.td} style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>{timeAgo(v.uploadedAt)}</td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}>
                    <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>
                  </td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}>
                    {v.status === "Pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <BtnPrimary className="!py-1 !px-3 !text-[12px]" onClick={() => openFeedback(v._id, "approve")}>
                          <span className="material-symbols-outlined text-[14px]">check_circle</span> Approve
                        </BtnPrimary>
                        <BtnDanger className="!py-1 !px-3 !text-[12px]" onClick={() => openFeedback(v._id, "reject")}>
                          <span className="material-symbols-outlined text-[14px]">cancel</span> Reject
                        </BtnDanger>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <BtnSecondary className="!py-1 !px-3 !text-[12px]" onClick={() => openFeedback(v._id, v.status === "Approved" ? "reject" : "approve")}>
                          Change
                        </BtnSecondary>
                      </div>
                    )}
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
          <div className="w-full max-w-[440px] rounded-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "0 20px 48px rgba(0,0,0,0.4)" }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
                {actionType === "approve" ? "✅ Approve Video" : "❌ Reject Video"}
              </h3>
              <button onClick={() => setFeedbackId(null)} className="text-[20px] cursor-pointer" style={{ color: "var(--text-muted)" }}>×</button>
            </div>
            <div className="p-6">
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-sm text-[13.5px] outline-none resize-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder={actionType === "approve" ? "Great work! Well explained…" : "Please re-record with better audio…"}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)";       e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <BtnSecondary onClick={() => setFeedbackId(null)}>Cancel</BtnSecondary>
              {actionType === "approve"
                ? <BtnPrimary onClick={submitFeedback}>Confirm Approval</BtnPrimary>
                : <BtnDanger  onClick={submitFeedback}>Confirm Rejection</BtnDanger>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoReviews;
