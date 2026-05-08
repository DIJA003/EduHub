import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Quick Links</h3>
        <div className="space-y-2">
          <button onClick={() => navigate("/std-dashboard")} className="block w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50">
            📊 Dashboard
          </button>
          <button onClick={() => navigate("/profile")} className="block w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50">
            👤 My Profile
          </button>
          <button onClick={() => navigate("/data-science-courses")} className="block w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50">
            🔬 Data Science Courses
          </button>
        </div>
      </div>
    </aside>
  );
}