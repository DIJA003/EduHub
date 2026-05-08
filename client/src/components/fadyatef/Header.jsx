import { useNavigate } from "react-router-dom";

export default function Header({ onAction }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">E</div>
          <span className="font-bold text-blue-600">EduHub</span>
        </div>
        <nav className="flex items-center gap-4">
          <button onClick={() => { navigate("/home"); onAction?.("Home"); }} className="text-sm text-slate-600 hover:text-blue-600">Home</button>
          <button onClick={() => { navigate("/academic-year"); onAction?.("Courses"); }} className="text-sm text-slate-600 hover:text-blue-600">Courses</button>
          <button onClick={() => { navigate("/profile"); onAction?.("Profile"); }} className="text-sm text-slate-600 hover:text-blue-600">Profile</button>
        </nav>
      </div>
    </header>
  );
}