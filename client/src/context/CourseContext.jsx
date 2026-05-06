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

          // Year done = all enrolled courses complete (no credit total check)
          const yearDone = allComplete;

          const status = yearDone
            ? "Completed"
            : enrolled.length > 0
            ? "In Progress"
            : hasContent
            ? "In Progress"
            : "Locked";

          // Use already-built `next[prevYid]` — not old stale state
          const prevYid     = String(ynum - 1);
          const prevDone    =
            ynum === 1 ||
            next[prevYid]?.meta?.status === "Completed" ||
            (next[prevYid]?.enrolled?.length > 0 &&
              next[prevYid].enrolled.every((c) => c.progress >= 100));

          const unlocked = ynum === 1 ? true : prevDone || enrolled.length > 0;

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
        const totalCredits = year.meta?.totalCredits ?? 42;
        const earned = computeYearEarnedCredits(enrolled);
        // Year is done when ALL enrolled courses are 100% complete.
        // We don't require earned >= totalCredits because a student may
        // be enrolled in fewer than the maximum courses for their year.
        const yearDone = allComplete;
        const nextYid = String(Number(yearId) + 1);

        let nextYears = {
          ...prev,
          [yearId]: withYearEarnedCredits({
            ...year,
            enrolled,
            meta: {
              ...year.meta,
              status: yearDone
                ? "Completed"
                : year.meta.status || "In Progress",
            },
          }),
        };

        if (yearDone && prev[nextYid] && !prev[nextYid].meta.unlocked) {
          nextYears = {
            ...nextYears,
            [nextYid]: {
              ...prev[nextYid],
              meta: {
                ...prev[nextYid].meta,
                unlocked: true,
                status:
                  prev[nextYid].meta.status === "Locked"
                    ? "In Progress"
                    : prev[nextYid].meta.status,
              },
            },
          };
        }
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

  useEffect(() => {
    //emptyyy
  });
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