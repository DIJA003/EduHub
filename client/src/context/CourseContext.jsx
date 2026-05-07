import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { enrollmentApi2, academicYearsApi, coursesFromYearApi } from "../services/api";
import { useAuth } from "./AuthContext";

const CourseContext = createContext(null);

// ── helpers ───────────────────────────────────────────────────────────────────
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
  if (!years) return null;
  const ordered = Object.keys(years).sort((a, b) => Number(a) - Number(b));
  const active = ordered.find((id) => {
    const m = years[id]?.meta;
    return m && m.unlocked !== false && m.status === "In Progress";
  });
  if (active) return active;
  const fallback = ordered.filter((id) => years[id]?.meta?.unlocked !== false);
  return fallback[fallback.length - 1] ?? ordered[0] ?? null;
}

function withYearEarnedCredits(year) {
  const earnedCredits = computeYearEarnedCredits(year.enrolled);
  return { ...year, meta: { ...year.meta, earnedCredits } };
}

// ── empty year shell ──────────────────────────────────────────────────────────
function emptyYear(yearNum) {
  return {
    meta: {
      title: `Year ${yearNum}`,
      description: "",
      status: "Locked",
      earnedCredits: 0,
      totalCredits: 42,
      unlocked: false,
      dbId: null,
    },
    enrolled: [],
    available: [],
  };
}

// ── CourseProvider ────────────────────────────────────────────────────────────
export function CourseProvider({ children }) {
  const { user } = useAuth();

  // years keyed by "1" | "2" | "3" | "4"
  const [years, setYears] = useState({
    1: emptyYear(1),
    2: emptyYear(2),
    3: emptyYear(3),
    4: emptyYear(4),
  });
  const [courseIdMap, setCourseIdMap] = useState({}); // localId → mongoId
  const [lastCompletedCourse, setLastCompletedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch everything from the backend on login ───────────────────────────
  useEffect(() => {
    if (!user) {
      setYears({ 1: emptyYear(1), 2: emptyYear(2), 3: emptyYear(3), 4: emptyYear(4) });
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // 1. Academic years from DB (year numbers 1-4, their names/titles)
        let dbYears = [];
        try {
          const ayRes = await academicYearsApi.getAll();
          dbYears = ayRes.data || [];
        } catch {
          // backend may not have academic years yet — still show courses
        }

        // 2. Published courses per year (1-4)
        const yearIds = ["1", "2", "3", "4"];
        const coursesPerYear = {};
        await Promise.all(
          yearIds.map(async (yid) => {
            try {
              const r = await coursesFromYearApi.getByYear(yid);
              coursesPerYear[yid] = r.data || [];
            } catch {
              coursesPerYear[yid] = [];
            }
          }),
        );

        // 3. Student enrollments
        let enrollments = [];
        try {
          const enrollRes = await enrollmentApi2.getAll();
          enrollments = enrollRes.data || [];
        } catch {
          enrollments = [];
        }

        // Build courseIdMap: localId (courseId from enrollment) → mongo _id
        const idMap = {};
        enrollments.forEach((e) => {
          if (e.courseId && e.id) idMap[e.id] = e.courseId;
        });
        setCourseIdMap(idMap);

        // 4. Assemble years state — built in order 1→2→3→4 so each year
        //    checks the already-built previous year for the unlock decision.
        const next = {};
        for (const yid of yearIds) {
          const ynum   = Number(yid);
          const dbYear = dbYears.find((y) => String(y.year) === yid);
          const hasContent = dbYear != null || (coursesPerYear[yid]?.length ?? 0) > 0;
          const title  = dbYear?.name || `Year ${ynum}`;

          const yearEnrollments = enrollments.filter(
            (e) => String(e.yearId || "1") === yid,
          );

          const enrolled = yearEnrollments.map((e) => ({
            id:                e.id,
            name:              e.name || "Course",
            code:              e.code || "",
            credits:           e.credits || 3,
            progress:          e.progress || 0,
            sectionsCompleted: e.sectionsCompleted || 0,
            nextItem:          e.nextItem || "Getting Started",
            mongoId:           e.courseId,
            instructor:        e.instructor || "",
          }));

          const enrolledIds      = new Set(enrolled.map((c) => c.id));
          const enrolledMongoIds = new Set(enrolled.map((c) => String(c.mongoId)));

          const available = (coursesPerYear[yid] || [])
            .filter(
              (c) =>
                !enrolledIds.has(String(c._id)) &&
                !enrolledMongoIds.has(String(c._id)),
            )
            .map((c) => ({
              id:         String(c._id),
              name:       c.title,
              code:       c.code,
              credits:    c.creditHours || 3,
              type:       "Core",
              length:     "16 weeks",
              schedule:   "MWF",
              instructor: c.instructor || "TBA",
              mongoId:    String(c._id),
            }));

          const allComplete   = enrolled.length > 0 && enrolled.every((c) => c.progress >= 100);
          const earnedCredits = computeYearEarnedCredits(enrolled);
          const totalCredits  = dbYear ? (dbYear.totalCredits || 42) : 42;

          // Credit thresholds to unlock each year
          // Year 1: always open
          // Year 2: 39+ total earned credits across ALL years
          // Year 3: 78+ total earned credits across ALL years
          // Year 4: 117+ total earned credits across ALL years
          const UNLOCK_THRESHOLDS = { 1: 0, 2: 39, 3: 78, 4: 117 };

          // Total earned credits across all already-built years + this year
          const totalEarnedSoFar = Object.values(next).reduce(
            (sum, y) => sum + (y.meta?.earnedCredits ?? 0), 0
          ) + earnedCredits;

          const threshold = UNLOCK_THRESHOLDS[ynum] ?? 0;
          const meetsThreshold = totalEarnedSoFar >= threshold;

          // Year done = all enrolled courses complete
          const yearDone = allComplete;

          // Unlocked if:
          // - Year 1 always
          // - Already has enrollments (was previously unlocked)
          // - Meets credit threshold
          const unlocked = ynum === 1 ? true : enrolled.length > 0 || meetsThreshold;

          const status = yearDone
            ? "Completed"
            : enrolled.length > 0
            ? "In Progress"
            : unlocked
            ? "In Progress"
            : "Locked";

          next[yid] = withYearEarnedCredits({
            meta: {
              title,
              description: dbYear?.description || "",
              status,
              earnedCredits,
              totalCredits,
              unlocked,
              dbId: dbYear?._id || null,
            },
            enrolled,
            available,
          });
        }

        setYears(next);
      } catch (err) {
        console.warn("CourseContext: failed to load from backend:", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const currentYearId = useMemo(
    () => getCurrentAcademicYearId(years),
    [years],
  );

  // ── enrollCourse ──────────────────────────────────────────────────────────
  const enrollCourse = useCallback(
    (yearId, course) => {
      setYears((prev) => {
        const year = prev[yearId];
        if (!year) return prev;
        if (year.enrolled.some((c) => c.id === course.id)) return prev;
        const creditDelta = course.credits || 3;
        if (
          sumEnrolledCredits(year.enrolled) + creditDelta >
          (year.meta?.totalCredits ?? 42)
        )
          return prev;

        const enrolled = [
          ...year.enrolled,
          {
            id: course.id,
            name: course.name,
            code: course.code || "",
            credits: course.credits || 3,
            progress: 0,
            sectionsCompleted: 0,
            nextItem: "Getting Started",
            mongoId: course.mongoId || course.id,
            instructor: course.instructor || "",
          },
        ];
        const updatedYear = {
          ...year,
          enrolled,
          available: year.available.filter((c) => c.id !== course.id),
        };
        return {
          ...prev,
          [yearId]: withYearEarnedCredits(updatedYear),
        };
      });

      if (user) {
        const mongoId = course.mongoId || courseIdMap[course.id] || course.id;
        enrollmentApi2
          .enroll(mongoId)
          .catch((err) => console.warn("Backend enroll failed:", err.message));
      }
    },
    [user, courseIdMap],
  );

  // ── undoEnrollment ────────────────────────────────────────────────────────
  const undoEnrollment = useCallback(
    (yearId, courseId) => {
      setYears((prev) => {
        const year = prev[yearId];
        if (!year) return prev;
        const course = year.enrolled.find((c) => c.id === courseId);
        if (!course) return prev;
        const enrolled = year.enrolled.filter((c) => c.id !== courseId);
        const updatedYear = {
          ...year,
          enrolled,
          available: [
            ...year.available,
            {
              id: course.id,
              name: course.name,
              code: course.code,
              credits: course.credits || 3,
              type: "Core",
              length: "16 weeks",
              schedule: "MWF",
              instructor: course.instructor || "TBA",
              mongoId: course.mongoId || course.id,
            },
          ],
        };
        return { ...prev, [yearId]: withYearEarnedCredits(updatedYear) };
      });

      if (user) {
        const mongoId = courseIdMap[courseId] || courseId;
        enrollmentApi2
          .unenroll(mongoId)
          .catch((err) =>
            console.warn("Backend unenroll failed:", err.message),
          );
      }
    },
    [user, courseIdMap],
  );

  // ── updateCourseProgress ──────────────────────────────────────────────────
  const updateCourseProgress = useCallback(
    (yearId, courseId, payload) => {
      const { progress, nextItem, sectionsCompleted } = payload;
      setYears((prev) => {
        const year = prev[yearId];
        if (!year) return prev;
        const prevCourse = year.enrolled.find((c) => c.id === courseId);
        const enrolled = year.enrolled.map((c) =>
          c.id === courseId
            ? {
                ...c,
                progress,
                nextItem,
                ...(sectionsCompleted !== undefined
                  ? { sectionsCompleted }
                  : {}),
              }
            : c,
        );

        if (progress === 100 && prevCourse && prevCourse.progress < 100) {
          const done = enrolled.find((c) => c.id === courseId);
          setLastCompletedCourse({
            name: done.name,
            code: done.code,
            yearId,
            courseId,
            completedAt: new Date().toISOString(),
          });
        }

        // unlock next year if all done
        const allComplete =
          enrolled.length > 0 && enrolled.every((c) => c.progress >= 100);
        const yearDone = allComplete;

        let nextYears = {
          ...prev,
          [yearId]: withYearEarnedCredits({
            ...year,
            enrolled,
            meta: {
              ...year.meta,
              status: yearDone ? "Completed" : year.meta.status || "In Progress",
            },
          }),
        };

        // Check credit thresholds — unlock years when student earns enough credits
        // Year 2: 39 credits, Year 3: 78 credits, Year 4: 117 credits
        const UNLOCK_THRESHOLDS = { "2": 39, "3": 78, "4": 117 };
        const totalEarned = Object.keys(nextYears).reduce(
          (sum, yid) => sum + (nextYears[yid]?.meta?.earnedCredits ?? 0), 0
        );

        Object.entries(UNLOCK_THRESHOLDS).forEach(([yid, threshold]) => {
          if (totalEarned >= threshold && nextYears[yid] && !nextYears[yid].meta.unlocked) {
            nextYears = {
              ...nextYears,
              [yid]: {
                ...nextYears[yid],
                meta: {
                  ...nextYears[yid].meta,
                  unlocked: true,
                  status: nextYears[yid].meta.status === "Locked" ? "In Progress" : nextYears[yid].meta.status,
                },
              },
            };
          }
        });

        return nextYears;
      });

      if (user) {
        const mongoId = courseIdMap[courseId] || courseId;
        enrollmentApi2
          .updateProgress(mongoId, { progress, nextItem, sectionsCompleted })
          .catch((err) =>
            console.warn("Backend progress update failed:", err.message),
          );
      }
    },
    [user, courseIdMap],
  );

  // ── addCourseToYear (used when admin publishes a new course) ─────────────
  const addCourseToYear = useCallback((yearId, course) => {
    setYears((prev) => {
      const year = prev[yearId];
      if (!year) return prev;
      if (year.available?.some((c) => c.id === course.id)) return prev;
      if (year.enrolled?.some((c) => c.id === course.id)) return prev;
      return {
        ...prev,
        [yearId]: { ...year, available: [...(year.available || []), course] },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      years,
      currentYearId,
      lastCompletedCourse,
      loading,
      enrollCourse,
      undoEnrollment,
      updateCourseProgress,
      addCourseToYear,
    }),
    [
      years,
      currentYearId,
      lastCompletedCourse,
      loading,
      enrollCourse,
      undoEnrollment,
      updateCourseProgress,
      addCourseToYear,
    ],
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within a CourseProvider");
  return ctx;
}