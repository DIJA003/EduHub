import { useState, useEffect } from "react";

function Navbar() {
  const [isLight, setIsLight] = useState(() => {
    // Persist theme preference across page reloads
    return localStorage.getItem("eduhub-theme") === "light";
  });

  // Apply saved theme on mount
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
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
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          placeholder="Search anything..."
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

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--border-focus)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isLight ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer relative transition-all duration-150"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.borderColor = "var(--border-focus)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
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
          title="Admin"
          className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-150 hover:scale-105"
          style={{ border: "2px solid var(--border)" }}
        >
          A
        </div>
      </div>
    </header>
  );
}

export default Navbar;