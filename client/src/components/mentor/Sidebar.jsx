import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/mentor", icon: "dashboard", label: "Dashboard" },
  { to: "/mentor/reviews", icon: "rate_review", label: "Video Reviews" },
  { to: "/mentor/students", icon: "group", label: "Students" },
  { to: "/mentor/enroll", icon: "how_to_reg", label: "Enroll Students" },
  { to: "/mentor/upload", icon: "upload_file", label: "Upload Material" },
  { to: "/mentor/profile", icon: "manage_accounts", label: "My Profile" },
  // { to: "/change-password", icon: "lock", label: "Change Password" },
  { to: "/mentor/history", icon: "history", label: "My History" },
];

function Sidebar() {
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const initials = dbUser?.name
    ? dbUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "M";

  return (
    <aside
      className="w-[236px] flex flex-col flex-shrink-0 overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center text-white flex-shrink-0"
          style={{
            background: "var(--accent)",
            boxShadow: "0 4px 14px rgba(36,99,235,0.35)",
          }}
        >
          <span className="material-symbols-outlined text-[18px]">
            auto_stories
          </span>
        </div>
        <div>
          <h2
            className="text-[14.5px] font-bold tracking-tight leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            Edu<span style={{ color: "var(--accent-light)" }}>Hub</span>
          </h2>
          <p
            className="text-[11px] mt-0.5 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Mentor Portal
          </p>
        </div>
      </div>

      {/* Section label */}
      <p
        className="text-[10px] font-bold uppercase tracking-[0.1em] px-4 pt-4 pb-2"
        style={{ color: "var(--text-muted)" }}
      >
        Main Menu
      </p>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/mentor"}
            className="flex items-center gap-3 px-3 py-[9px] rounded-sm text-[13.5px] font-medium border-l-2 whitespace-nowrap overflow-hidden transition-all duration-150"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "var(--accent-glow)",
                    color: "var(--accent-light)",
                    borderLeftColor: "var(--accent-light)",
                    fontWeight: 600,
                  }
                : {
                    color: "var(--text-secondary)",
                    borderLeftColor: "transparent",
                  }
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.getAttribute("aria-current")) {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.getAttribute("aria-current")) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
          >
            <span className="material-symbols-outlined text-[16px] w-5 text-center flex-shrink-0">
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user + logout */}
      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="flex items-center gap-3 px-2 py-2 rounded-sm cursor-pointer transition-colors duration-150"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
          onClick={() => navigate("/mentor/profile")}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{
              background: "var(--accent)",
              border: "2px solid var(--border)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13.5px] font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {dbUser?.name || "Mentor"}
            </p>
            <p
              className="text-[11px] truncate"
              style={{ color: "var(--text-muted)" }}
            >
              Mentor
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Logout"
            className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-150"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--danger)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <span className="material-symbols-outlined text-[16px]">
              logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
