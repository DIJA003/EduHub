import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { dbUser } = useAuth();
  const [isLight, setIsLight] = useState(
    () => localStorage.getItem("eduhub-theme") === "light"
  );

  useEffect(() => {
    if (isLight) document.documentElement.classList.add("light");
    else          document.documentElement.classList.remove("light");
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("eduhub-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("eduhub-theme", "dark");
    }
  };

  const initials = dbUser?.name
    ? dbUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "M";

  const iconBtn = {
    base:  { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" },
    hover: { background: "var(--bg-hover)", color: "var(--text-primary)", borderColor: "var(--border-focus)" },
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-7 gap-4 flex-shrink-0 z-10"
      style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-[300px]">
        <span
          className="material-symbols-outlined absolute left-[10px] top-1/2 -translate-y-1/2 text-[14px] pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          search
        </span>
        <input
          className="w-full pl-8 pr-3 py-[7px] rounded-sm text-[12.5px] outline-none"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          placeholder="Search..."
          onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)"; }}
          onBlur={(e)  => { e.target.style.borderColor = "var(--border)";       e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to dark" : "Switch to light"}
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150"
          style={iconBtn.base}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, iconBtn.hover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, iconBtn.base)}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isLight ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer relative transition-all duration-150"
          style={iconBtn.base}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: "var(--bg-hover)", borderColor: "var(--border-focus)" })}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, iconBtn.base)}
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span
            className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full"
            style={{ background: "var(--danger)", border: "2px solid var(--bg-surface)" }}
          />
        </button>

        <div className="w-px h-[22px] flex-shrink-0 mx-1" style={{ background: "var(--border)" }} />

        {/* Avatar */}
        <div
          title={dbUser?.name || "Mentor"}
          className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-150 hover:scale-105"
          style={{ background: "var(--accent)", border: "2px solid var(--border)" }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
