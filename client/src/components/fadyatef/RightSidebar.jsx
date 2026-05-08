import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/auth.store";

export default function RightSidebar() {
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const role = dbUser?.role || "student";

  const getDashboardPath = () => {
    switch (role) {
      case "admin":
        return "/admin";
      case "mentor":
        return "/mentor";
      default:
        return "/student";
    }
  };

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-[var(--color-text)]">Quick Links</h3>
        <div className="space-y-2">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-left text-sm text-[var(--color-text-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-left text-sm text-[var(--color-text-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
          >
            👤 My Profile
          </button>
          <button
            onClick={() => navigate("/academic-year")}
            className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-left text-sm text-[var(--color-text-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
          >
            � Browse Courses
          </button>
        </div>
      </div>
    </aside>
  );
}