import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/fadyatef/Header";
import AcademicPathSection from "../components/fadyatef/AcademicPathSection";
import RecommendedSection from "../components/fadyatef/RecommendedSection";
import RightSidebar from "../components/fadyatef/RightSidebar";
import Footer from "../components/fadyatef/Footer";

export default function AcademicYear() {
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const handleAction = (label) => {
    if (label === "Resume Last Lesson") {
      navigate("/academic-year/2");
    } else if (label === "Home") {
      navigate("/home#how-it-works");
    } else if (label === "STD dashboard") {
      navigate("/std-dashboard");
    }
  };

  const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAction={handleAction} />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <section className="mb-8 grid gap-6 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[2fr,1.5fr] md:p-6 lg:p-8">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                Welcome back, {firstName}!
              </p>

              {dbUser && (
                <div className="mt-2 mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {dbUser.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {dbUser.name}
                    </span>
                    {dbUser.college && dbUser.college !== "—" && (
                      <span className="ml-2 text-xs text-slate-400">
                        • {dbUser.college}
                      </span>
                    )}
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-blue-600">
                      {dbUser.role}
                    </span>
                  </div>
                </div>
              )}

              <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl lg:text-3xl">
                Select your current year to view your academic path and upcoming
                milestones.
              </h1>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                onClick={() => handleAction("Resume Last Lesson")}
              >
                Resume Last Lesson
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                onClick={() => handleAction("View Schedule")}
              >
                View Schedule
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

        <div className="grid gap-8 lg:grid-cols-[2.2fr,1.3fr]">
          <div className="space-y-6">
            <AcademicPathSection />
            <RecommendedSection onAction={handleAction} />
          </div>
          <RightSidebar onAction={handleAction} />
        </div>

        <Footer onAction={handleAction} />
      </main>
    </div>
  );
}
