import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
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

const CourseContext = createContext(null);

/** Credits counted only when course progress === 100 */
export function computeYearEarnedCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce(
    (sum, c) => sum + (c.progress >= 100 ? c.credits || 0 : 0),
    0,
  );
}

/** Sum of credits for all enrolled courses (planned load for the year) */
export function sumEnrolledCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce((sum, c) => sum + (c.credits || 0), 0);
}

/** Active academic year: unlocked and explicitly In Progress */
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
  return {
    ...year,
    meta: {
      ...year.meta,
      earnedCredits,
    },
  };
}

const INITIAL_STATE = {
  lastCompletedCourse: null,
  years: {
    1: {
      meta: {
        title: "Year One: Freshman Year",
        description:
          "Foundational concepts: computing, mathematics, and logic.",
        status: "Completed",
        earnedCredits: 42,
        totalCredits: 42,
        unlocked: true,
      },
      enrolled: YEAR_1_ENROLLED,
      available: [],
    },
    2: {
      meta: {
        title: "Year Two: Sophomore Year",
        description:
          "Core engineering principles and advanced programming foundations.",
        status: "In Progress",
        earnedCredits: 0,
        totalCredits: 42,
        unlocked: true,
      },
      enrolled: YEAR_2_ENROLLED,
      available: YEAR_2_AVAILABLE,
    },
    3: {
      meta: {
        title: "Year Three: Junior Year",
        description:
          "Advanced applications: software engineering, cloud, and AI.",
        status: "Locked",
        earnedCredits: 0,
        totalCredits: 42,
        unlocked: false,
      },
      enrolled: [],
      plannedCurriculum: YEAR_3_PLANNED,
      available: YEAR_3_AVAILABLE,
    },
    4: {
      meta: {
        title: "Year Four: Senior Year",
        description:
          "Capstone, research, and industry placement.",
        status: "Locked",
        earnedCredits: 0,
        totalCredits: 42,
        unlocked: false,
      },
      enrolled: [],
      plannedCurriculum: YEAR_4_PLANNED,
      available: YEAR_4_AVAILABLE,
    },
  },
};

function applyYearCompletionAndUnlock(prev, yearId, updatedYear) {
  const total = updatedYear.meta?.totalCredits ?? 42;
  const earned = computeYearEarnedCredits(updatedYear.enrolled);
  const allComplete =
    updatedYear.enrolled.length > 0 &&
    updatedYear.enrolled.every((c) => c.progress >= 100);
  const creditsMet = earned >= total;
  const yearDone = allComplete && creditsMet;

  const meta = {
    ...updatedYear.meta,
    earnedCredits: earned,
    status: yearDone ? "Completed" : updatedYear.meta.status || "In Progress",
  };

  const nextId = String(Number(yearId) + 1);
  const nextYear = prev.years[nextId];
  let yearsOut = {
    ...prev.years,
    [yearId]: {
      ...updatedYear,
      meta,
    },
  };

  if (yearDone && nextYear && !nextYear.meta.unlocked) {
    yearsOut = {
      ...yearsOut,
      [nextId]: {
        ...nextYear,
        meta: {
          ...nextYear.meta,
          unlocked: true,
          status:
            nextYear.meta.status === "Locked" ? "In Progress" : nextYear.meta.status,
        },
      },
    };
  }

  return { ...prev, years: yearsOut };
}

export function CourseProvider({ children }) {
  const [state, setState] = useState(() => {
    const y = { ...INITIAL_STATE.years };
    Object.keys(y).forEach((id) => {
      y[id] = withYearEarnedCredits(y[id]);
    });
    return {
      ...INITIAL_STATE,
      years: y,
    };
  });

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
      const cap = year.meta?.totalCredits ?? 42;
      if (sumEnrolledCredits(year.enrolled) + creditDelta > cap) return prev;

      const enrolled = [
        ...year.enrolled,
        {
          id: course.id,
          name: course.name,
          code: course.code || "ELEC",
          credits: course.credits || 3,
          progress: 0,
          sectionsCompleted: 0,
          nextItem: "Getting Started",
        },
      ];
      const updatedYear = { ...year, enrolled, available: year.available.filter((c) => c.id !== course.id) };
      const withEarned = withYearEarnedCredits(updatedYear);
      return {
        ...prev,
        years: {
          ...prev.years,
          [yearId]: withEarned,
        },
      };
    });
  }, []);

  const updateCourseProgress = useCallback((yearId, courseId, payload) => {
    const { progress, nextItem, sectionsCompleted } = payload;
    setState((prev) => {
      const year = prev.years[yearId];
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

      let nextState = { ...prev };
      if (progress === 100 && prevCourse && prevCourse.progress < 100) {
        const done = enrolled.find((c) => c.id === courseId);
        nextState = {
          ...nextState,
          lastCompletedCourse: {
            name: done.name,
            code: done.code,
            yearId,
            courseId,
            completedAt: new Date().toISOString(),
          },
        };
      }

      const updatedYear = { ...year, enrolled };
      const merged = applyYearCompletionAndUnlock(nextState, yearId, updatedYear);
      return merged;
    });
  }, []);

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
        available: [
          ...year.available,
          {
            id: course.id,
            name: course.name,
            type: "Elective",
            length: "Self-paced",
            schedule: "Flexible",
            instructor: "TBA",
            credits: course.credits || 3,
          },
        ],
      };
      const withEarned = withYearEarnedCredits(updatedYear);
      return {
        ...prev,
        years: {
          ...prev.years,
          [yearId]: withEarned,
        },
      };
    });
  }, []);


  const addCourseToYear = useCallback((yearId, course) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      // avoid duplicates
      if (year.available?.some((c) => c.id === course.id)) return prev;
      if (year.enrolled?.some((c) => c.id === course.id)) return prev;
      return {
        ...prev,
        years: {
          ...prev.years,
          [yearId]: {
            ...year,
            available: [...(year.available || []), course],
          },
        },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      years: state.years,
      currentYearId,
      lastCompletedCourse: state.lastCompletedCourse,
      enrollCourse,
      undoEnrollment,
      updateCourseProgress,
      addCourseToYear,
    }),
    [
      state.years,
      currentYearId,
      state.lastCompletedCourse,
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