import { useNavigate } from "react-router-dom";
import { EduHubLogo } from "../ui/Logo";

export default function Header({ onAction }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => { navigate("/home"); onAction?.("Home"); }}
        >
          <EduHubLogo className="h-8 w-8 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" />
          <span className="font-bold text-[var(--color-accent)]">EduHub</span>
        </button>
        <nav className="flex items-center gap-4">
          <button
            onClick={() => { navigate("/home"); onAction?.("Home"); }}
            className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-accent)] transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => { navigate("/academic-year"); onAction?.("Courses"); }}
            className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-accent)] transition-colors"
          >
            Courses
          </button>
          <button
            onClick={() => { navigate("/profile"); onAction?.("Profile"); }}
            className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-accent)] transition-colors"
          >
            Profile
          </button>
        </nav>
      </div>
    </header>
  );
}