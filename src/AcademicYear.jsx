import React from "react";
import Header from "./components/Header";
import AcademicPathSection from "./components/AcademicPathSection";
import RecommendedSection from "./components/RecommendedSection";
import RightSidebar from "./components/RightSidebar";
import Footer from "./components/Footer";

export default function AcademicYear() {
  const handleAction = (label) => {
    alert(`You clicked: ${label}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAction={handleAction} />

    
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <section className="mb-8 grid gap-6 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[2fr,1.5fr] md:p-6 lg:p-8">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-edublue uppercase tracking-wide">
                Welcome back, Alex!
              </p>
              <h1 className="mt-2 text-xl font-semibold text-slate-900 md:text-2xl lg:text-3xl">
                Select your current year to view your academic path and upcoming
                milestones.
              </h1>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full bg-edublue px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-600"
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
