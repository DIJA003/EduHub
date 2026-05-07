import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";
import BrandMark from "../../../components/layout/BrandMark";
import ThemeToggle from "../../../components/layout/ThemeToggle";

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
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text)]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" animated />
            <span className="text-lg font-black text-[var(--color-accent)]">
              EduHub
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-[var(--color-text-2)] transition-colors hover:text-[var(--color-accent)]"
            >
              Features
            </a>
            <a
              href="#roles"
              className="text-sm font-medium text-[var(--color-text-2)] transition-colors hover:text-[var(--color-accent)]"
            >
              How it works
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-ink)] py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="mb-4 inline-block rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] px-4 py-1 text-[var(--text-xs)] font-bold uppercase tracking-widest text-[var(--color-accent)]">
            Academic Learning Platform
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl">
            Empowering Students{" "}
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text text-transparent">&amp; Mentors</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-text-2)]">
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
            <p className="mt-6 text-[var(--text-sm)] text-[var(--color-text-3)]">
              Welcome back, <strong>{user.name}</strong>! 👋
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/40 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Students" },
              { value: "1.2K+", label: "Expert Mentors" },
              { value: "200+", label: "Partner Colleges" },
              { value: "98%", label: "Success Rate" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-2)] bg-clip-text font-display text-4xl font-semibold tracking-tight text-transparent">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-3)]">
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
            <h2 className="font-display text-3xl font-semibold text-[var(--color-text)] lg:text-4xl">
              Powerful Features for Everyone
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-text-2)]">
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
                className="group rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-8 shadow-[var(--shadow-md)] backdrop-blur-md transition-[transform,border-color,box-shadow] duration-[var(--duration-normal)] hover:-translate-y-1 hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow-xl)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] text-2xl transition-transform duration-[var(--duration-normal)] group-hover:scale-110">
                  {f.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
                  {f.title}
                </h3>
                <p className="leading-relaxed text-[var(--color-text-2)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/35 py-20 backdrop-blur-sm lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-text)] lg:text-4xl">
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
                className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-8 text-center shadow-[var(--shadow-sm)] backdrop-blur-md transition-all duration-[var(--duration-normal)] hover:border-[var(--color-accent)]/30 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="text-5xl mb-4">{r.emoji}</div>
                <h3 className="mb-3 text-xl font-semibold text-[var(--color-text)]">
                  {r.role}
                </h3>
                <p className="mb-6 text-[var(--color-text-2)]">{r.desc}</p>
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
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-accent)] to-[#3d52e8] p-12 text-center shadow-[var(--shadow-xl)] ring-4 ring-[var(--color-accent)]/10">
          <h2 className="font-display text-3xl font-semibold text-white lg:text-4xl">
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
      <footer className="border-t border-[var(--color-border)] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#516dff] text-xs font-black text-white">
              E
            </div>
            <span className="font-semibold text-[var(--color-text-2)]">EduHub</span>
          </div>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)]">
            © {new Date().getFullYear()} EduHub Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
