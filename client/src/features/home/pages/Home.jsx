import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/common/Header";
import Button from "../../../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, role, loading } = useAuth();
  const [hasSyncIssue, setHasSyncIssue] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasSyncIssue(searchParams.get("auth") === "sync-required");

    // Redirect authenticated users to their dashboard
    if (isAuthenticated && role && !loading) {
      if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "mentor") navigate("/mentor", { replace: true });
      else if (role === "student") navigate("/student", { replace: true });
    }
  }, [searchParams, isAuthenticated, role, loading, navigate]);

  const handleGetStarted = () => {
    if (!isAuthenticated) return navigate("/register");
    if (role === "admin") return navigate("/admin");
    if (role === "mentor") return navigate("/mentor");
    return navigate("/academic-year");
  };

  // Show loading state while checking auth
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--color-accent)] border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--color-text-2)]">Checking authentication...</p>
            <p className="text-sm text-[var(--color-text-3)] mt-2">This will only take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text)]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatePresence>
            {hasSyncIssue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] px-4 py-3 text-sm text-[var(--color-warning)]"
              >
                We could not sync your account profile. Please sign in again or contact support if the issue persists.
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block mb-4 rounded-full bg-[var(--color-accent-soft)] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]">
              Academic Learning Platform
            </span>
            
            <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)] sm:text-6xl lg:text-7xl">
              Empowering Students{" "}
              <span className="text-[var(--color-accent)]">&amp; Mentors</span>
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

            <AnimatePresence>
              {isAuthenticated && user && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-sm text-[var(--color-text-3)]"
                >
                  Welcome back, <strong>{user.name}</strong>! 👋
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[var(--color-border)] py-12 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "50K+", label: "Active Students" },
              { value: "1.2K+", label: "Expert Mentors" },
              { value: "200+", label: "Partner Faculties" },
              { value: "98%", label: "Success Rate" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-black text-[var(--color-accent)]">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-3)]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-[var(--color-text)] lg:text-4xl">
              Powerful Features for Everyone
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-2)] max-w-2xl mx-auto">
              Designed to bridge the gap between learning and professional
              guidance.
            </p>
          </motion.div>

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
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-8 hover:shadow-lg hover:border-[var(--color-accent)] transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-2)]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="bg-[var(--color-surface)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-black text-[var(--color-text)] lg:text-4xl">
              Tailored for Your Role
            </h2>
          </motion.div>
          
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
                desc: "Full platform control: manage users, courses, faculties, programs, academic years, enrollments, and view detailed audit logs.",
                cta: "Admin Access",
                path: "/login",
              },
            ].map((roleInfo, index) => (
              <motion.div
                key={roleInfo.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border)] p-8 text-center hover:border-[var(--color-accent)] hover:shadow-md transition-all"
              >
                <div className="text-5xl mb-4">{roleInfo.emoji}</div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                  {roleInfo.role}
                </h3>
                <p className="text-[var(--color-text-2)] mb-6">{roleInfo.desc}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(roleInfo.path)}
                >
                  {roleInfo.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white lg:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Join thousands of students and mentors on EduHub today.
            </p>
            <Button
              className="mt-8 bg-white text-[var(--color-accent)] hover:bg-gray-50 px-10"
              size="lg"
              onClick={() => navigate("/register")}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-12 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-black">
              E
            </div>
            <span className="font-bold text-[var(--color-text)]">EduHub</span>
          </div>
          <p className="text-sm text-[var(--color-text-3)]">
            © {new Date().getFullYear()} EduHub Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
