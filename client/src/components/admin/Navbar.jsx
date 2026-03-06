import { useState, useEffect } from "react";

function Navbar() {
  const [isLight, setIsLight] = useState(
    () => document.documentElement.classList.contains("light")
  );

  const toggleTheme = () => {
    document.documentElement.classList.toggle("light");
    setIsLight((prev) => !prev);
  };

  return (
    <header className="h-14 bg-surface border-b border-[var(--border)] flex items-center justify-between px-7 gap-4 flex-shrink-0 z-10 transition-[background-color,border-color] duration-200">
      {/* Search */}
      <div className="relative flex-1 max-w-[300px]">
        <span className="material-symbols-outlined absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[14px] pointer-events-none">
          search
        </span>
        <input
          className="w-full bg-card border border-[var(--border)] text-[var(--text-primary)] pl-8 pr-3 py-[7px] rounded-sm text-[12.5px] outline-none transition-all duration-150
                     placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
          placeholder="Search anything..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          className="w-[34px] h-[34px] bg-card border border-[var(--border)] text-[var(--text-secondary)] rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-hover hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isLight ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="w-[34px] h-[34px] bg-card border border-[var(--border)] text-[var(--text-secondary)] rounded-sm flex items-center justify-center cursor-pointer relative transition-all duration-150 hover:bg-hover hover:text-[var(--text-primary)] hover:border-[var(--border-focus)]"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] bg-danger rounded-full border-2 border-[var(--bg-surface)]" />
        </button>

        <div className="w-px h-[22px] bg-[var(--border)] flex-shrink-0 mx-1" />

        {/* Avatar */}
        <div
          title="Admin"
          className="w-8 h-8 rounded-full bg-accent border-2 border-[var(--border)] text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-150 hover:shadow-[0_0_0_3px_var(--accent-glow)] hover:scale-105"
        >
          A
        </div>
      </div>
    </header>
  );
}

export default Navbar;