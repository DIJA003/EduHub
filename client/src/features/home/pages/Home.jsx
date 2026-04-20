import { Link } from "react-router-dom";
import useAuthStore from "../../../stores/auth.store";

const FEATURES = [
  {
    icon: "📚",
    title: "Structured curriculum",
    desc: "Year-by-year academic progression with organised course material.",
  },
  {
    icon: "🎓",
    title: "Expert mentors",
    desc: "Work directly with qualified mentors who review your submitted work.",
  },
  {
    icon: "📊",
    title: "Track progress",
    desc: "Monitor your completion rate and materials across every enrolled course.",
  },
  {
    icon: "🔔",
    title: "Real-time notifications",
    desc: "Instant alerts when your submissions are reviewed or approved.",
  },
];

export default function Home() {
  const { firebaseUser, role } = useAuthStore();

  const getDashboardLink = () => {
    if (!firebaseUser) return null;
    if (role === "admin")
      return { to: "/admin", label: "Go to Admin Dashboard" };
    if (role === "mentor")
      return { to: "/mentor", label: "Go to Mentor Dashboard" };
    return { to: "/std-dashboard", label: "Go to Dashboard" };
  };

  const dashLink = getDashboardLink();

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-lg font-black tracking-tight text-blue-600">
            EduHub
          </span>
          <div className="flex items-center gap-3">
            {dashLink ? (
              <Link
                to={dashLink.to}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
              >
                {dashLink.label}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 mb-6">
          🎓 Academic Learning Management
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
          Learn smarter.
          <br />
          <span className="text-blue-600">Guided by experts.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-500">
          EduHub connects students with mentors through a structured,
          year-by-year curriculum. Upload work, get feedback, and track your
          academic growth.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start for free
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-black text-slate-900">
            Why EduHub?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900">
            Ready to start learning?
          </h2>
          <p className="mt-3 text-slate-500">
            Join students and mentors building their academic careers on EduHub.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} EduHub. All rights reserved.
      </footer>
    </div>
  );
}
