import React from "react";

function StatPill({ label, value }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function YearCard({ year, title, description, status, highlighted }) {
  const statusColor =
    status === "Completed"
      ? "text-emerald-600"
      : status === "In Progress"
      ? "text-amber-600"
      : "text-slate-500";

  const dotColor =
    status === "Completed"
      ? "bg-emerald-500"
      : status === "In Progress"
      ? "bg-amber-400"
      : "bg-slate-300";

  return (
    <button
      className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm text-left transition 
      hover:-translate-y-1 hover:shadow-md
      ${
        highlighted
          ? "border-edublue/60 bg-sky-50"
          : "border-slate-200 hover:border-edublue/40"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition
          ${highlighted ? "bg-edublue text-white" : "bg-slate-100 text-slate-700"}`}
        >
          {year}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 flex-1">{description}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 font-medium ${statusColor}`}>
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {status}
        </span>
        {highlighted && (
          <span className="text-slate-500">
            Current Focus: <span className="font-semibold">Semester 4</span>
          </span>
        )}
      </div>
    </button>
  );
}

function CourseCard({ tag, tagColor, title, type, duration, imageUrl, onClick }) {
  return (
    <button
      className="group flex min-w-[260px] flex-col overflow-hidden rounded-2xl border border-slate-200
                 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${tagColor}`}
        >
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-edublue">
          {title}
        </h4>
        <p className="text-xs text-slate-500">
          {type} • {duration}
        </p>
      </div>
    </button>
  );
}

export default function App() {
  const handleAction = (label) => {
    alert(`You clicked: ${label}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="EduHub logo"
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-semibold text-slate-900">EduHub</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <button className="font-medium text-slate-900 hover:text-edublue">
              Academic Years
            </button>
            <button
              className="hover:text-edublue"
              onClick={() => handleAction("Courses")}
            >
              Courses
            </button>
            <button
              className="hover:text-edublue"
              onClick={() => handleAction("Mentors")}
            >
              Mentors
            </button>
            <button
              className="hover:text-edublue"
              onClick={() => handleAction("Profile")}
            >
              Profile
            </button>
            <div className="flex items-center gap-3">
              <img
                src="/profile.png"
                alt="Profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {/* Welcome banner */}
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
            {/* Hero image */}
            <img
              src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Students collaborating"
              className="h-40 w-full max-w-md rounded-2xl object-cover md:h-48 lg:h-56"
            />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[2.2fr,1.3fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Academic path */}
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Your Academic Path
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <YearCard
                  year="1"
                  title="Year One"
                  description="Foundational Concepts: Principles of computing, mathematics, and logic."
                  status="Completed"
                />
                <YearCard
                  year="2"
                  title="Year Two"
                  description="Intermediate Specializations: Data structures, algorithms, and systems."
                  status="In Progress"
                  highlighted
                />
                <YearCard
                  year="3"
                  title="Year Three"
                  description="Advanced Applications: Software engineering, cloud architecture, and AI."
                  status="Locked"
                />
                <YearCard
                  year="4"
                  title="Year Four"
                  description="Final Research & Thesis: Industry placements and capstone projects."
                  status="Locked"
                />
              </div>
            </section>

            {/* Recommended courses */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Recommended for You
                </h2>
                <button className="text-xs font-semibold text-edublue hover:underline">
                  View All
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <CourseCard
                  tag="CS305"
                  tagColor="bg-sky-600"
                  title="Algorithms"
                  type="Core • Algorithms CS305"
                  duration="14 Weeks"
                  imageUrl="/algorithms-course.jpg"
                  onClick={() => handleAction("Algorithms CS305")}
                />
                <CourseCard
                  tag="CS303"
                  tagColor="bg-emerald-600"
                  title="Software Analysis"
                  type="Core • Software Analysis CS303"
                  duration="12 Weeks"
                  imageUrl="https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800"
                  onClick={() => handleAction("Software Analysis CS303")}
                />
                <CourseCard
                  tag="CS308"
                  tagColor="bg-amber-500"
                  title="Database"
                  type="Core • Database CS308"
                  duration="12 Weeks"
                  imageUrl="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
                  onClick={() => handleAction("Database CS308")}
                />
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Degree progress */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Degree Progress
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <div className="h-24 w-24 rounded-full border-[6px] border-slate-200" />
                  <div className="absolute h-24 w-24 rounded-full border-[6px] border-edublue border-t-transparent border-l-transparent rotate-45" />
                  <span className="absolute text-xl font-semibold text-slate-900">
                    65%
                  </span>
                </div>
                <div className="space-y-3">
                  <StatPill label="Total Credits" value="120 / 180" />
                  <StatPill label="GPA" value="3.8 / 4.0" />
                </div>
              </div>
            </section>

            {/* Quick links */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Quick Links
              </h2>
              <div className="space-y-2 text-sm">
                {[
                  "Download Curriculum",
                  "View Full Schedule",
                  "Find Study Group",
                  "Contact Advisor",
                ].map((item) => (
                  <button
                    key={item}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                    onClick={() => handleAction(item)}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Help card */}
            <section className="rounded-2xl bg-edublue p-5 text-white shadow-md">
              <h3 className="text-sm font-semibold">Need Help?</h3>
              <p className="mt-2 text-sm text-blue-100">
                Book a 1-on-1 session with a senior mentor to discuss your path.
              </p>
              <button
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-edublue transition hover:bg-slate-100"
                onClick={() => handleAction("Find a Mentor")}
              >
                Find a Mentor
              </button>
            </section>
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-10 text-xs text-slate-500">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:justify-between">
            <div className="max-w-sm space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="EduHub logo"
                  className="h-8 w-8 object-contain"
                />
                <span className="text-sm font-semibold text-slate-900">
                  EduHub
                </span>
              </div>
              <p className="text-[11px] md:text-xs">
                Empowering students with world-class education tools and resources
                to build their future.
              </p>
            </div>

            <div className="grid flex-1 gap-8 text-[11px] sm:grid-cols-2 md:grid-cols-3 md:text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Platform</h4>
                <ul className="space-y-1">
                  {["Dashboard", "All Courses", "Mentorship", "Resources"].map(
                    (item) => (
                      <li key={item}>
                        <button
                          className="transition hover:text-edublue hover:underline"
                          onClick={() => handleAction(item)}
                        >
                          {item}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Company</h4>
                <ul className="space-y-1">
                  {["About Us", "Careers", "Press", "Contact"].map((item) => (
                    <li key={item}>
                      <button
                        className="transition hover:text-edublue hover:underline"
                        onClick={() => handleAction(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Social</h4>
                <ul className="space-y-1">
                  {["Twitter", "LinkedIn", "Instagram", "Community"].map(
                    (item) => (
                      <li key={item}>
                        <button
                          className="transition hover:text-edublue hover:underline"
                          onClick={() => handleAction(item)}
                        >
                          {item}
                        </button>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
              <span>© 2024 EduHub Inc. All rights reserved.</span>
              <div className="flex gap-6">
                <button className="hover:text-slate-700">Privacy Policy</button>
                <button className="hover:text-slate-700">Terms of Service</button>
                <button className="hover:text-slate-700">Cookie Settings</button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}