import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Badge, BtnPrimary, BtnSecondary, FormGroup, FormInput } from "../../components/admin/adminUtils";

const MOCK_COURSES = [
  { name: "Data Structures", students: 32, videos: 8,  status: "Active"   },
  { name: "Algorithms",      students: 28, videos: 12, status: "Active"   },
  { name: "Web Dev",         students: 45, videos: 20, status: "Active"   },
  { name: "Databases",       students: 15, videos: 5,  status: "Inactive" },
];

const MOCK_STATS = [
  { label: "Videos Reviewed", value: "39",  icon: "rate_review",   color: "blue"  },
  { label: "Approved",         value: "34",  icon: "check_circle",  color: "green" },
  { label: "Rejected",         value: "5",   icon: "cancel",        color: "red"   },
  { label: "Total Students",   value: "120", icon: "group",         color: "amber" },
];

const COLOR_MAP = {
  blue:  { bg: "var(--accent-glow)",  color: "var(--accent-light)" },
  green: { bg: "var(--success-bg)",   color: "var(--success)"      },
  red:   { bg: "var(--danger-bg)",    color: "var(--danger)"       },
  amber: { bg: "var(--warning-bg)",   color: "var(--warning)"      },
};

function MentorProfile() {
  const { dbUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name:    dbUser?.name    || "Mentor User",
    email:   dbUser?.email   || "mentor@university.edu",
    college: dbUser?.college || "Faculty of Engineering",
    bio:     dbUser?.bio     || "Passionate about teaching and helping students grow.",
  });
  const [saving, setSaving] = useState(false);

  const initials = form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    // TODO: PUT /api/users/profile  { name, bio, ... }
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setEditMode(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="My Profile" subtitle="Manage your personal information and account settings." />

      {/* Profile card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Banner */}
        <div
          className="h-28 relative"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #1d4ed8 100%)" }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
          />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "var(--accent)", border: "4px solid var(--bg-surface)", boxShadow: "0 4px 16px rgba(36,99,235,0.4)" }}
            >
              {initials}
            </div>
            <div className="flex gap-2 mt-12">
              {editMode ? (
                <>
                  <BtnSecondary onClick={() => setEditMode(false)}>Cancel</BtnSecondary>
                  <BtnPrimary onClick={handleSave}>{saving ? "Saving…" : "Save Changes"}</BtnPrimary>
                </>
              ) : (
                <BtnSecondary onClick={() => setEditMode(true)}>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Profile
                </BtnSecondary>
              )}
            </div>
          </div>

          {editMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup label="Full Name">
                <FormInput value={form.name}    onChange={(e) => setForm((f) => ({ ...f, name:    e.target.value }))} placeholder="Full name" />
              </FormGroup>
              <FormGroup label="Email">
                <FormInput value={form.email}   onChange={(e) => setForm((f) => ({ ...f, email:   e.target.value }))} placeholder="Email" type="email" />
              </FormGroup>
              <FormGroup label="College / Department">
                <FormInput value={form.college} onChange={(e) => setForm((f) => ({ ...f, college: e.target.value }))} placeholder="e.g. Faculty of Engineering" />
              </FormGroup>
              <FormGroup label="Bio">
                <FormInput value={form.bio}     onChange={(e) => setForm((f) => ({ ...f, bio:     e.target.value }))} placeholder="Short bio…" />
              </FormGroup>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[22px] font-bold" style={{ color: "var(--text-primary)" }}>{form.name}</h2>
                <Badge variant="blue">Mentor</Badge>
              </div>
              <p className="text-[13.5px] mt-1" style={{ color: "var(--text-secondary)" }}>{form.email}</p>
              {form.college && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ color: "var(--text-muted)" }}>school</span>
                  <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>{form.college}</span>
                </div>
              )}
              {form.bio && (
                <p className="text-[13px] mt-3 max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>{form.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map((s) => {
          const c = COLOR_MAP[s.color] || COLOR_MAP.blue;
          return (
            <div
              key={s.label}
              className="p-5 rounded-xl flex flex-col gap-3 cursor-default transition-all duration-200 hover:-translate-y-px"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div className="flex items-start justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: "var(--text-secondary)" }}>
                  {s.label}
                </h4>
                <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ background: c.bg, color: c.color }}>
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </div>
              </div>
              <h2 className="text-[28px] font-bold font-mono tracking-[-1.5px] leading-none" style={{ color: "var(--text-primary)" }}>
                {s.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Courses I supervise */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Courses I Supervise</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          {MOCK_COURSES.map((c) => (
            <div
              key={c.name}
              className="p-5 flex items-center justify-between transition-colors duration-150"
              style={{ background: "var(--bg-surface)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: "var(--accent-glow)" }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: "var(--accent-light)" }}>menu_book</span>
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                  <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {c.students} students · {c.videos} videos
                  </p>
                </div>
              </div>
              <Badge variant={c.status === "Active" ? "success" : "default"}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Account settings */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>Account Settings</h3>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "Change Password",         icon: "lock",             action: "Change" },
            { label: "Email Notifications",     icon: "notifications",    action: "Manage" },
            { label: "Privacy Settings",        icon: "shield",           action: "Review" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-sm cursor-pointer transition-all duration-150"
              style={{ border: "1px solid var(--border)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--text-secondary)" }}>{item.icon}</span>
                <span className="text-[13.5px]" style={{ color: "var(--text-primary)" }}>{item.label}</span>
              </div>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--accent-light)" }}>{item.action} →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MentorProfile;
