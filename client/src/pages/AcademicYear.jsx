import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import Header from "../components/fadyatef/Header";
import AcademicPathSection from "../components/fadyatef/AcademicPathSection";
import RecommendedSection from "../components/fadyatef/RecommendedSection";
import RightSidebar from "../components/fadyatef/RightSidebar";
import Footer from "../components/fadyatef/Footer";

export default function AcademicYear() {
  const navigate = useNavigate();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("http://localhost:8000/api/users/login", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAction = (label) => {
    alert(`You clicked: ${label}`);
  };

  // Extract first name for friendly greeting
  const firstName = dbUser?.name
    ? dbUser.name.split(" ")[0]
    : "there";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Hero banner */}
        <section className="mb-8 grid gap-6 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[2fr,1.5fr] md:p-6 lg:p-8">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Welcome back, {firstName}!
              </p>

              {/* User info strip */}
              {dbUser && (
                <div className="mt-2 mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {dbUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">{dbUser.name}</span>
                    {dbUser.college && dbUser.college !== "—" && (
                      <span className="ml-2 text-xs text-slate-400">• {dbUser.college}</span>
                    )}
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-blue-600">
                      {dbUser.role}
                    </span>
                  </div>
                </div>
              )}

              <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl lg:text-3xl">
                Select your current year to view your academic path and upcoming milestones.
              </h1>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                onClick={() => navigate("/std-dashboard")}
              >
                Dashboard
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                onClick={() => navigate("/academic-year#courses")}
              >
                Courses
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Students collaborating"
              className="h-40 w-full max-w-md rounded-2xl object-cover md:h-48 lg:h-56"
            />
          </div>
        </section>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-[2.2fr,1.3fr]">
          <div className="space-y-6">
            <AcademicPathSection />
            <section id="courses">
              <RecommendedSection onAction={handleAction} />
            </section>
          </div>
          <RightSidebar onAction={handleAction} />
        </div>

        <Footer onAction={handleAction} />
      </main>
    </div>
  );
}