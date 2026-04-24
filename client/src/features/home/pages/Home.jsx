import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const handleGetStarted = () => {
    if (!isAuthenticated) return navigate("/register");
    if (role === "admin") return navigate("/admin");
    if (role === "mentor") return navigate("/mentor");
    return navigate("/academic-year");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black">
              E
            </div>
            <span className="text-lg font-black text-blue-600">EduHub</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#roles"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Get Started
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={handleGetStarted}>
                {role === "admin"
                  ? "Admin Dashboard"
                  : role === "mentor"
                    ? "Mentor Dashboard"
                    : "My Courses"}
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block mb-4 rounded-full bg-blue-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Academic Learning Platform
          </span>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Empowering Students{" "}
            <span className="text-blue-600">&amp; Mentors</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            A unified platform for collaboration, mentorship, and academic
            growth. Track your 4-year journey, upload materials, and connect
            with expert mentors.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted} className="px-8">
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/login")}
                className="px-8"
              >
                Sign In
              </Button>
            )}
          </div>

          {isAuthenticated && user && (
            <p className="mt-6 text-sm text-slate-500">
              Welcome back, <strong>{user.name}</strong>! 👋
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Students" },
              { value: "1.2K+", label: "Expert Mentors" },
              { value: "200+", label: "Partner Colleges" },
              { value: "98%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-blue-600">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 lg:text-4xl">
              Powerful Features for Everyone
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Designed to bridge the gap between learning and professional
              guidance.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Smart Academic Paths",
                desc: "Navigate your 4-year journey with structured year-by-year course progression and milestone tracking.",
              },
              {
                icon: "📤",
                title: "Material Review System",
                desc: "Students upload study materials that go through mentor review before being shared, ensuring quality.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Real-time dashboards for students, mentors, and admins with detailed analytics and audit logs.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 lg:text-4xl">
              Tailored for Your Role
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                emoji: "🎓",
                role: "For Students",
                desc: "Track progress across 4 academic years, enroll in courses, upload study materials, and get mentor feedback.",
                cta: "Start Learning",
                path: "/register",
              },
              {
                emoji: "👨‍🏫",
                role: "For Mentors",
                desc: "Review student-uploaded materials, manage enrolled students, upload your own resources, and track your impact.",
                cta: "Become a Mentor",
                path: "/register",
              },
              {
                emoji: "🏛️",
                role: "For Admins",
                desc: "Full platform control: manage users, courses, colleges, academic years, enrollments, and view detailed audit logs.",
                cta: "Admin Access",
                path: "/login",
              },
            ].map((r) => (
              <div
                key={r.role}
                className="bg-white rounded-2xl border border-slate-200 p-8 text-center hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="text-5xl mb-4">{r.emoji}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {r.role}
                </h3>
                <p className="text-slate-500 mb-6">{r.desc}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(r.path)}
                >
                  {r.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl rounded-3xl bg-blue-600 p-12 text-center">
          <h2 className="text-3xl font-black text-white lg:text-4xl">
            Ready to start your journey?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of students and mentors on EduHub today.
          </p>
          <Button
            className="mt-8 bg-white text-blue-700 hover:bg-blue-50 px-10"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black">
              E
            </div>
            <span className="font-bold text-slate-700">EduHub</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} EduHub Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
