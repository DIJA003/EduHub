import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import { getSectionsForCourse, nextSectionLabel } from "../data/courseSections";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";

function sectionsCompletedFromProgress(progress, total) {
  if (!total) return 0;
  return Math.min(total, Math.round((progress / 100) * total));
}

export default function CoursePlayer() {
  const navigate = useNavigate();
  const { yearId, courseId } = useParams();
  const [searchParams] = useSearchParams();
  const uploadMode = searchParams.get("upload") === "1";

  const { years, updateCourseProgress } = useCourses();
  const { materials, addMaterial, removeMaterial } = useMaterials();
  const fileInputRef = useRef(null);

  const year = years[yearId];
  const course = year?.enrolled?.find((c) => c.id === courseId);

  const sections = useMemo(
    () => (course ? getSectionsForCourse(courseId, course.name) : []),
    [course, courseId],
  );
  const n = sections.length;

  const sectionsDone = useMemo(() => {
    if (!course || !n) return 0;
    if (course.sectionsCompleted != null) return course.sectionsCompleted;
    return sectionsCompletedFromProgress(course.progress, n);
  }, [course, n]);

  const [started, setStarted] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);

  const isStarted = started || (course?.progress ?? 0) > 0;
  const courseComplete = n > 0 && (course?.progress ?? 0) >= 100;

  const maxReadableIndex =
    courseComplete ? n - 1 : Math.min(sectionsDone, n - 1);

  useEffect(() => {
    if (!course || !n) return;
    const cap = courseComplete ? n - 1 : Math.min(sectionsDone, n - 1);
    setViewIndex((v) => Math.min(Math.max(v, 0), cap));
  }, [course, n, sectionsDone, courseComplete, courseId]);

  const handleAction = (label) => {
    if (label === "Home" || label === "Mentors") navigate("/home");
    else if (label === "Courses") navigate("/academic-year");
  };

  const [selectedSectionId, setSelectedSectionId] = useState(null);

  useEffect(() => {
    if (sections.length && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  if (!year) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Year not found.</p>
        <button
          type="button"
          className="ml-4 rounded-full bg-blue-600 px-4 py-2 text-sm text-white"
          onClick={() => navigate("/academic-year")}
        >
          Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onAction={handleAction} />
        <main className="mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-slate-600">
            You are not enrolled in this course for Year {yearId}.
          </p>
          <button
            type="button"
            className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700"
            onClick={() => navigate(`/academic-year/${yearId}`)}
          >
            Back to year
          </button>
        </main>
        <Footer onAction={handleAction} />
      </div>
    );
  }

  const isSectionReadable = (idx) => {
    if (!isStarted && !courseComplete) return false;
    if (courseComplete) return idx >= 0 && idx < n;
    return idx >= 0 && idx <= maxReadableIndex;
  };

  const currentSection = sections[viewIndex];

  const handleStart = () => {
    setStarted(true);
    setViewIndex(0);
  };

  const handleNext = () => {
    if (!n) return;
    const doneCount =
      course.sectionsCompleted ??
      sectionsCompletedFromProgress(course.progress, n);
    const nextDone = Math.min(n, doneCount + 1);
    const newProgress = Math.min(100, Math.round((nextDone / n) * 100));
    const done = nextDone >= n;
    updateCourseProgress(yearId, courseId, {
      progress: newProgress,
      nextItem: done ? "Course complete" : nextSectionLabel(sections, nextDone),
      sectionsCompleted: nextDone,
    });
    if (!done) {
      setStarted(true);
      setViewIndex(Math.min(nextDone, n - 1));
    } else {
      setViewIndex(n - 1);
    }
  };

  const handlePrev = () => {
    setViewIndex((i) => Math.max(0, i - 1));
  };

  const selectSection = (idx) => {
    if (uploadMode) {
      setSelectedSectionId(sections[idx]?.id);
      return;
    }
    if (!isSectionReadable(idx)) return;
    setViewIndex(idx);
  };

  const courseMaterials = materials.filter((m) => m.courseId === courseId);
  const sectionMaterials = selectedSectionId
    ? courseMaterials.filter((m) => m.sectionId === selectedSectionId)
    : [];

  const handleUploadFiles = (e) => {
    const files = e.target.files;
    if (!files?.length || !selectedSectionId) return;
    const sec = sections.find((s) => s.id === selectedSectionId);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
          ? "photo"
          : file.type === "application/pdf"
            ? "pdf"
            : "file";
      addMaterial({
        courseId,
        courseName: course.name,
        fileName: file.name,
        type,
        sectionId: selectedSectionId,
        sectionLabel: sec?.title ?? "Section",
      });
    }
    e.target.value = "";
  };

  const showNextButton =
    isStarted &&
    !uploadMode &&
    !courseComplete &&
    viewIndex === sectionsDone &&
    sectionsDone < n;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAction={handleAction} />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Year {yearId} / {course.code}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              {course.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {uploadMode
                ? "Choose a section, then upload materials for that section."
                : "Open any unlocked section to review. Use Next only on your current section to advance progress."}
            </p>
            <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  navigate(`/academic-year/${yearId}/course/${courseId}`)
                }
                className={`rounded-full px-3 py-1 font-medium ${
                  !uploadMode
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Study
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/academic-year/${yearId}/course/${courseId}?upload=1`,
                  )
                }
                className={`rounded-full px-3 py-1 font-medium ${
                  uploadMode
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Upload
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500">Progress</p>
            <p className="text-lg font-semibold text-slate-900">
              {course.progress}%
            </p>
            <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width]"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Next:{" "}
              <span className="font-medium text-slate-700">
                {course.nextItem}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sections
            </h2>
            <ol className="mt-3 space-y-2">
              {sections.map((s, idx) => {
                const done = courseComplete || idx < sectionsDone;
                const readable = uploadMode || isSectionReadable(idx);
                const active =
                  uploadMode
                    ? selectedSectionId === s.id
                    : viewIndex === idx;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => selectSection(idx)}
                      disabled={!uploadMode && !readable}
                      className={`flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                        !readable && !uploadMode
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      } ${
                        active
                          ? "border-edublue/60 bg-blue-50 ring-1 ring-edublue/30"
                          : uploadMode
                            ? "border-slate-100 hover:border-slate-200"
                            : "border-transparent bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <span
                        className={
                          done
                            ? "text-emerald-600"
                            : active
                              ? "text-blue-600"
                              : "text-slate-400"
                        }
                      >
                        {done ? "✓" : `${idx + 1}.`}
                      </span>
                      <span>
                        <span className="font-medium text-slate-900">
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {s.summary}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {uploadMode ? (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  Upload material
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Section:{" "}
                  <span className="font-medium text-slate-900">
                    {sections.find((s) => s.id === selectedSectionId)?.title ??
                      "—"}
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,image/*,.pdf"
                  className="hidden"
                  onChange={handleUploadFiles}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <span>📎</span> Choose files
                </button>
                <div className="mt-6 space-y-2">
                  <h3 className="text-xs font-semibold uppercase text-slate-500">
                    Files in this section
                  </h3>
                  {sectionMaterials.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No files for this section yet.
                    </p>
                  ) : (
                    sectionMaterials.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {m.fileName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {m.sectionLabel && (
                              <span>{m.sectionLabel} · </span>
                            )}
                            {new Date(m.uploadDate).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-xs text-rose-600 hover:underline"
                          onClick={() => removeMaterial(m.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-semibold uppercase text-slate-500">
                    All materials in this course
                  </h3>
                  <div className="mt-2 space-y-2">
                    {courseMaterials.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No uploads yet for this course.
                      </p>
                    ) : (
                      courseMaterials.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                        >
                          <span className="text-slate-800">{m.fileName}</span>
                          <span className="text-xs text-slate-500">
                            {m.sectionLabel || "General"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : !isStarted && !courseComplete ? (
              <div className="py-8 text-center">
                <p className="text-slate-600">
                  This course has {n} section{n !== 1 ? "s" : ""}. When you are
                  ready, start with the first section.
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start
                </button>
              </div>
            ) : (
              <>
                {courseComplete && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <strong>Course complete.</strong> You can open any section
                    on the left to review.
                  </div>
                )}
                {!courseComplete &&
                  viewIndex < sectionsDone &&
                  sectionsDone > 0 && (
                    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      Review mode — browsing a section you already finished.
                    </div>
                  )}
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Section {viewIndex + 1} of {n}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {currentSection?.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {currentSection?.summary}
                </p>
                <div className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                  {currentSection?.body}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={viewIndex <= 0}
                    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {showNextButton && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {sectionsDone >= n - 1 ? "Finish course" : "Next"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="mt-8 rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => navigate(`/academic-year/${yearId}`)}
        >
          Back to year
        </button>
      </main>
      <Footer onAction={handleAction} />
    </div>
  );
}
