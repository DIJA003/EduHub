import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  YEAR_1_ENROLLED,
  YEAR_2_ENROLLED,
  YEAR_2_AVAILABLE,
  YEAR_3_PLANNED,
  YEAR_3_AVAILABLE,
  YEAR_4_PLANNED,
  YEAR_4_AVAILABLE,
} from "../data/yearCourseCatalog";
import { enrollmentApi2, courseCatalogApi } from "../services/api";
import { useAuth } from "./AuthContext";

const CourseContext = createContext(null);
const STORAGE_KEY = "eduhub-course-state-v3";

export function computeYearEarnedCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce(
    (sum, c) => sum + (c.progress >= 100 ? c.credits || 0 : 0),
    0,
  );
}

export function sumEnrolledCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce((sum, c) => sum + (c.credits || 0), 0);
}

export function getCurrentAcademicYearId(years) {
  if (!years) return "2";
  const ordered = Object.keys(years).sort((a, b) => Number(a) - Number(b));
  const active = ordered.find((id) => {
    const m = years[id]?.meta;
    return m && m.unlocked !== false && m.status === "In Progress";
  });
  if (active) return active;
  const fallback = ordered.filter((id) => years[id]?.meta?.unlocked !== false);
  return fallback[fallback.length - 1] ?? ordered[0] ?? "2";
}

function withYearEarnedCredits(year) {
  const earnedCredits = computeYearEarnedCredits(year.enrolled);
  return { ...year, meta: { ...year.meta, earnedCredits } };
}

const BASE_STATE = {
  lastCompletedCourse: null,
  years: {
    1: {
      meta: { title: "Year One: Freshman Year", description: "Foundational concepts: computing, mathematics, and logic.", status: "Completed", earnedCredits: 42, totalCredits: 42, unlocked: true },
      enrolled: YEAR_1_ENROLLED,
      available: [],
    },
    2: {
      meta: { title: "Year Two: Sophomore Year", description: "Core engineering principles and advanced programming foundations.", status: "In Progress", earnedCredits: 0, totalCredits: 42, unlocked: true },
      enrolled: YEAR_2_ENROLLED,
      available: YEAR_2_AVAILABLE,
    },
    3: {
      meta: { title: "Year Three: Junior Year", description: "Advanced applications: software engineering, cloud, and AI.", status: "Locked", earnedCredits: 0, totalCredits: 42, unlocked: false },
      enrolled: [],
      plannedCurriculum: YEAR_3_PLANNED,
      available: YEAR_3_AVAILABLE,
    },
    4: {
      meta: { title: "Year Four: Senior Year", description: "Capstone, research, and industry placement.", status: "Locked", earnedCredits: 0, totalCredits: 42, unlocked: false },
      enrolled: [],
      plannedCurriculum: YEAR_4_PLANNED,
      available: YEAR_4_AVAILABLE,
    },
  },
};

// ── localStorage helpers ───────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    // Only persist the parts that change — not the big static catalog data
    const toSave = {
      lastCompletedCourse: state.lastCompletedCourse,
      years: {},
    };
    Object.keys(state.years).forEach((id) => {
      const y = state.years[id];
      toSave.years[id] = {
        meta: y.meta,
        enrolled: y.enrolled,
        // Don't save available — it's rebuilt from catalog + backend
      };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore storage errors
  }
}

function mergeStoredState(base, stored) {
  if (!stored) return base;
  const merged = { ...base, lastCompletedCourse: stored.lastCompletedCourse ?? base.lastCompletedCourse };
  merged.years = { ...base.years };

  Object.keys(stored.years || {}).forEach((id) => {
    const storedYear = stored.years[id];
    const baseYear = base.years[id];
    if (!baseYear) return;

    // For enrolled: if stored has more/different courses use stored
    // but keep baseYear.available so catalog items still show
    merged.years[id] = {
      ...baseYear,
      meta: { ...baseYear.meta, ...(storedYear.meta || {}) },
      enrolled: storedYear.enrolled?.length > 0 ? storedYear.enrolled : baseYear.enrolled,
    };
  });

  return merged;
}

function applyYearCompletionAndUnlock(prev, yearId, updatedYear) {
  const total = updatedYear.meta?.totalCredits ?? 42;
  const earned = computeYearEarnedCredits(updatedYear.enrolled);
  const allComplete = updatedYear.enrolled.length > 0 && updatedYear.enrolled.every((c) => c.progress >= 100);
  const yearDone = allComplete && earned >= total;

  const meta = { ...updatedYear.meta, earnedCredits: earned, status: yearDone ? "Completed" : updatedYear.meta.status || "In Progress" };
  const nextId = String(Number(yearId) + 1);
  const nextYear = prev.years[nextId];
  let yearsOut = { ...prev.years, [yearId]: { ...updatedYear, meta } };

  if (yearDone && nextYear && !nextYear.meta.unlocked) {
    yearsOut = {
      ...yearsOut,
      [nextId]: { ...nextYear, meta: { ...nextYear.meta, unlocked: true, status: nextYear.meta.status === "Locked" ? "In Progress" : nextYear.meta.status } },
    };
  }
  return { ...prev, years: yearsOut };
}

export function CourseProvider({ children }) {
  const { user } = useAuth();

  const [state, setState] = useState(() => {
    // Start with stored state merged over base
    const stored = loadState();
    const merged = mergeStoredState(BASE_STATE, stored);
    const y = { ...merged.years };
    Object.keys(y).forEach((id) => { y[id] = withYearEarnedCredits(y[id]); });
    return { ...merged, years: y };
  });

  const [courseIdMap, setCourseIdMap] = useState({});

  // ── Persist to localStorage on every state change ──────────────────────────
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Sync from backend on login ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const syncFromBackend = async () => {
      try {
        // 1. Load admin-created published courses per year
        const yearIds = ["1", "2", "3", "4"];
        const yearCourses = {};
        await Promise.all(
          yearIds.map(async (yid) => {
            try {
              const r = await courseCatalogApi.getByYear(yid);
              yearCourses[yid] = r.data || [];
            } catch {
              yearCourses[yid] = [];
            }
          })
        );

        // 2. Load student enrollments
        const enrollRes = await enrollmentApi2.getAll();
        const enrollments = enrollRes.data || [];

        const idMap = {};
        enrollments.forEach((e) => { if (e.courseId && e.id) idMap[e.id] = e.courseId; });
        setCourseIdMap(idMap);

        setState((prev) => {
          const years = {};

          yearIds.forEach((yid) => {
            const year = prev.years[yid];
            if (!year) return;

            // Merge admin courses into available (don't duplicate)
            const adminCourses = yearCourses[yid] || [];
            const existingIds = new Set([
              ...(year.available || []).map((c) => String(c.id)),
              ...(year.enrolled || []).map((c) => String(c.id)),
            ]);
            const newAdminCourses = adminCourses
              .filter((c) => !existingIds.has(String(c._id)))
              .map((c) => ({
                id: String(c._id),
                name: c.title,
                code: c.code,
                credits: c.creditHours || 3,
                type: "Core",
                length: "16 weeks",
                schedule: "MWF",
                instructor: c.instructor || "TBA",
                mongoId: String(c._id),
              }));

            years[yid] = {
              ...year,
              available: [...(year.available || []), ...newAdminCourses],
            };
          });

          // Apply enrollments — update progress from backend (backend is source of truth for progress)
          enrollments.forEach((e) => {
            const yid = String(e.yearId || "2");
            if (!years[yid]) return;
            const year = years[yid];

            // Remove from available
            const available = (year.available || []).filter(
              (c) => c.id !== e.id && String(c.id) !== String(e.courseId)
            );

            // Update or add to enrolled
            const existing = year.enrolled.find(
              (c) => c.id === e.id || String(c.id) === String(e.courseId)
            );

            const updatedCourse = {
              id: e.id,
              name: e.name,
              code: e.code,
              credits: e.credits,
              progress: Math.max(e.progress || 0, existing?.progress || 0), // keep higher
              sectionsCompleted: Math.max(e.sectionsCompleted || 0, existing?.sectionsCompleted || 0),
              nextItem: e.nextItem || existing?.nextItem || "Getting Started",
              mongoId: e.courseId,
            };

            const enrolled = existing
              ? year.enrolled.map((c) => (c.id === e.id ? { ...c, ...updatedCourse } : c))
              : [...year.enrolled, updatedCourse];

            years[yid] = withYearEarnedCredits({ ...year, enrolled, available });
          });

          // Fill in any years not touched
          yearIds.forEach((yid) => {
            if (!years[yid]) years[yid] = prev.years[yid];
          });

          return { ...prev, years };
        });
      } catch (err) {
        console.warn("CourseContext: backend sync failed, using local state:", err.message);
      }
    };

    syncFromBackend();
  }, [user]);

  const currentYearId = useMemo(
    () => getCurrentAcademicYearId(state.years),
    [state.years],
  );

  const enrollCourse = useCallback((yearId, course) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      if (year.enrolled.some((c) => c.id === course.id)) return prev;
      const creditDelta = course.credits || 3;
      if (sumEnrolledCredits(year.enrolled) + creditDelta > (year.meta?.totalCredits ?? 42)) return prev;

      const enrolled = [...year.enrolled, {
        id: course.id,
        name: course.name,
        code: course.code || "ELEC",
        credits: course.credits || 3,
        progress: 0,
        sectionsCompleted: 0,
        nextItem: "Getting Started",
        mongoId: course.mongoId || null,
      }];
      const updatedYear = { ...year, enrolled, available: year.available.filter((c) => c.id !== course.id) };
      return { ...prev, years: { ...prev.years, [yearId]: withYearEarnedCredits(updatedYear) } };
    });

    if (user) {
      const mongoId = course.mongoId || courseIdMap[course.id];
      if (mongoId) {
        enrollmentApi2.enroll(mongoId).catch((err) => console.warn("Backend enroll failed:", err.message));
      }
    }
  }, [user, courseIdMap]);

  const updateCourseProgress = useCallback((yearId, courseId, payload) => {
    const { progress, nextItem, sectionsCompleted } = payload;
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      const prevCourse = year.enrolled.find((c) => c.id === courseId);
      const enrolled = year.enrolled.map((c) =>
        c.id === courseId ? { ...c, progress, nextItem, ...(sectionsCompleted !== undefined ? { sectionsCompleted } : {}) } : c,
      );
      let nextState = { ...prev };
      if (progress === 100 && prevCourse && prevCourse.progress < 100) {
        const done = enrolled.find((c) => c.id === courseId);
        nextState = { ...nextState, lastCompletedCourse: { name: done.name, code: done.code, yearId, courseId, completedAt: new Date().toISOString() } };
      }
      return applyYearCompletionAndUnlock(nextState, yearId, { ...year, enrolled });
    });

    if (user) {
      const mongoId = courseIdMap[courseId];
      const targetId = mongoId || courseId;
      enrollmentApi2.updateProgress(targetId, { progress, nextItem, sectionsCompleted })
        .catch((err) => console.warn("Backend progress update failed:", err.message));
    }
  }, [user, courseIdMap]);

  const undoEnrollment = useCallback((yearId, courseId) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      const course = year.enrolled.find((c) => c.id === courseId);
      if (!course) return prev;
      const enrolled = year.enrolled.filter((c) => c.id !== courseId);
      const updatedYear = {
        ...year,
        enrolled,
        available: [...year.available, { id: course.id, name: course.name, type: "Elective", length: "Self-paced", schedule: "Flexible", instructor: "TBA", credits: course.credits || 3, mongoId: course.mongoId || null }],
      };
      return { ...prev, years: { ...prev.years, [yearId]: withYearEarnedCredits(updatedYear) } };
    });

    if (user) {
      const mongoId = courseIdMap[courseId];
      const targetId = mongoId || courseId;
      enrollmentApi2.unenroll(targetId).catch((err) => console.warn("Backend unenroll failed:", err.message));
    }
  }, [user, courseIdMap]);

  const addCourseToYear = useCallback((yearId, course) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      if (year.available?.some((c) => c.id === course.id)) return prev;
      if (year.enrolled?.some((c) => c.id === course.id)) return prev;
      return { ...prev, years: { ...prev.years, [yearId]: { ...year, available: [...(year.available || []), course] } } };
    });
  }, []);

  const value = useMemo(() => ({
    years: state.years,
    currentYearId,
    lastCompletedCourse: state.lastCompletedCourse,
    enrollCourse,
    undoEnrollment,
    updateCourseProgress,
    addCourseToYear,
  }), [state.years, currentYearId, state.lastCompletedCourse, enrollCourse, undoEnrollment, updateCourseProgress, addCourseToYear]);

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within a CourseProvider");
  return ctx;
}