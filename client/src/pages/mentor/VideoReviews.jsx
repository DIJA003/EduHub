import { useState } from "react";
import { useMaterials } from "../../context/MaterialContext";
import { Badge, PageHeader, TableWrap, TableSearch, EmptyState, BtnPrimary, BtnDanger, BtnSecondary, tw } from "../../components/admin/adminUtils";

const STATUS_VARIANT = { pending: "warning", approved: "success", rejected: "danger" };

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function VideoReviews() {
  const { materials, pendingMaterials, approveMaterial, rejectMaterial } = useMaterials();

  // Combine pending from context + mock data for display
  const MOCK = [
    { id: "m1", fileName: "Intro to Linked Lists",  uploader: "Ahmed Samy",   courseName: "Data Structures", status: "pending",  uploadDate: "2025-03-10T10:00:00Z" },
    { id: "m2", fileName: "CSS Flexbox Deep Dive",  uploader: "Nour Tarek",   courseName: "Web Dev",         status: "pending",  uploadDate: "2025-03-11T08:30:00Z" },
    { id: "m3", fileName: "Binary Trees Explained", uploader: "Omar Khalid",  courseName: "Algorithms",      status: "approved", uploadDate: "2025-03-09T14:00:00Z" },
    { id: "m4", fileName: "React Hooks Tutorial",   uploader: "Layla Hassan", courseName: "Web Dev",         status: "approved", uploadDate: "2025-03-08T09:15:00Z" },
    { id: "m5", fileName: "SQL Joins Crash Course", uploader: "Karim Ali",    courseName: "Databases",       status: "rejected", uploadDate: "2025-03-07T11:45:00Z" },
  ];

  // Merge real pending materials from students with mock data
  const allMaterials = [
    ...pendingMaterials.map((m) => ({ ...m, uploader: m.uploader || "Student" })),
    ...MOCK.filter((mock) => !pendingMaterials.some((p) => p.id === mock.id)),
  ];

  const [localStatus, setLocalStatus] = useState({});
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [feedbackId,   setFeedbackId]   = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionType,   setActionType]   = useState("");

  const getStatus = (m) => localStatus[m.id] ?? m.status;

  const filtered = allMaterials.filter((v) =>
    (v.fileName?.toLowerCase().includes(search.toLowerCase()) ||
     v.uploader?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "All" || getStatus(v) === statusFilter.toLowerCase())
  );

  const openFeedback = (id, type) => { setFeedbackId(id); setActionType(type); setFeedbackText(""); };

  const submitFeedback = () => {
    const newStatus = actionType === "approve" ? "approved" : "rejected";
    setLocalStatus((prev) => ({ ...prev, [feedbackId]: newStatus }));
    // If it's a real material from context, update context too
    if (pendingMaterials.some((m) => m.id === feedbackId)) {
      if (actionType === "approve") approveMaterial(feedbackId);
      else rejectMaterial(feedbackId);
    }
    setFeedbackId(null);
  };

  const FILTER_BTNS = ["All", "Pending", "Approved", "Rejected"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Reviews"
        subtitle="Review, approve, or reject student-uploaded materials before they go live."
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
          <EmptyState icon="📋" title="No materials found" description="Try adjusting your search or filter." />
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
              {filtered.map((v) => {
                const status = getStatus(v);
                return (
                  <tr
                    key={v.id}
                    className={tw.trHover}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className={tw.td} style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--accent-light)" }}>description</span>
                        <span className="font-medium">{v.fileName}</span>
                      </div>
                    </td>
                    <td className={tw.td} style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>{v.uploader}</td>
                    <td className={tw.td} style={{ borderColor: "var(--border)" }}><Badge variant="blue">{v.courseName}</Badge></td>
                    <td className={tw.td} style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>{timeAgo(v.uploadDate)}</td>
                    <td className={tw.td} style={{ borderColor: "var(--border)" }}>
                      <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
                    </td>
                    <td className={tw.td} style={{ borderColor: "var(--border)" }}>
                      {status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <BtnPrimary className="!py-1 !px-3 !text-[12px]" onClick={() => openFeedback(v.id, "approve")}>
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Approve
                          </BtnPrimary>
                          <BtnDanger className="!py-1 !px-3 !text-[12px]" onClick={() => openFeedback(v.id, "reject")}>
                            <span className="material-symbols-outlined text-[14px]">cancel</span> Reject
                          </BtnDanger>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <BtnSecondary className="!py-1 !px-3 !text-[12px]"
                            onClick={() => openFeedback(v.id, status === "approved" ? "reject" : "approve")}>
                            Change
                          </BtnSecondary>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                {actionType === "approve" ? "✅ Approve Material" : "❌ Reject Material"}
              </h3>
              <button onClick={() => setFeedbackId(null)} className="text-[20px] cursor-pointer" style={{ color: "var(--text-muted)" }}>×</button>
            </div>
            <div className="p-6">
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-sm text-[13.5px] outline-none resize-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder={actionType === "approve" ? "Great work! Well explained…" : "Please revise and re-upload…"}
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