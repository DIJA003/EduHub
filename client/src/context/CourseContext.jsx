import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { studentApi } from "../services/api";

const CourseContext = createContext(null);

const INITIAL_STATE = {
  years: {
    2: {
      meta: {
        title: "Year Two: Sophomore Year",
        description:
          "Core engineering principles and advanced programming foundations.",
        status: "In Progress",
        earnedCredits: 12,
        totalCredits: 21,
      },
      enrolled: [
        {
          id: "cs201",
          name: "Data Structures",
          code: "CS201",
          credits: 4,
          progress: 75,
          nextItem: "Graph Algorithms",
        },
        {
          id: "cs202",
          name: "Algorithms",
          code: "CS202",
          credits: 4,
          progress: 40,
          nextItem: "Dynamic Programming",
        },
        {
          id: "ma301",
          name: "Discrete Mathematics",
          code: "MA301",
          credits: 4,
          progress: 15,
          nextItem: "Set Theory Quiz",
        },
        {
          id: "ee205",
          name: "Computer Architecture",
          code: "EE205",
          credits: 4,
          progress: 90,
          nextItem: "Final Review",
        },
      ],
      available: [
        {
          id: "web-frameworks",
          name: "Web Development Frameworks",
          type: "Elective",
          length: "8 weeks",
          schedule: "MWF",
          instructor: "Prof. Miller",
        },
        {
          id: "db-systems",
          name: "Database Systems",
          type: "Core",
          length: "10 weeks",
          schedule: "TTh",
          instructor: "Dr. Sarah J.",
        },
        {
          id: "cyber-ethics",
          name: "Cybersecurity Ethics",
          type: "Elective",
          length: "6 weeks",
          schedule: "Fri",
          instructor: "Prof. Alan T.",
        },
      ],
    },
  },
};

export function CourseProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const enrollCourse = useCallback((yearId, course) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      if (year.enrolled.some((c) => c.id === course.id)) return prev;

      const creditDelta = course.credits || 3;
      const updatedMeta = {
        ...year.meta,
        earnedCredits: Math.min(
          year.meta.earnedCredits + creditDelta,
          year.meta.totalCredits,
        ),
      };

      return {
        ...prev,
        years: {
          ...prev.years,
          [yearId]: {
            ...year,
            meta: updatedMeta,
            enrolled: [
              ...year.enrolled,
              {
                id: course.id,
                name: course.name,
                code: course.code || "ELEC",
                credits: course.credits || 3,
                progress: 0,
                nextItem: "Getting Started",
              },
            ],
            available: year.available.filter((c) => c.id !== course.id),
          },
        },
      };
    });
  }, []);

  const undoEnrollment = useCallback((yearId, courseId) => {
    setState((prev) => {
      const year = prev.years[yearId];
      if (!year) return prev;
      const course = year.enrolled.find((c) => c.id === courseId);
      if (!course) return prev;

      const creditDelta = course.credits || 3;
      return {
        ...prev,
        years: {
          ...prev.years,
          [yearId]: {
            ...year,
            meta: {
              ...year.meta,
              earnedCredits: Math.max(year.meta.earnedCredits - creditDelta, 0),
            },
            enrolled: year.enrolled.filter((c) => c.id !== courseId),
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
          },
        },
      };
    });
  }, []);

  useEffect(() => {
    studentApi
      .getSavedCourses()
      .then((res) => {})
      .catch(() => {});
  });
  const value = useMemo(
    () => ({ years: state.years, enrollCourse, undoEnrollment }),
    [state.years, enrollCourse, undoEnrollment],
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
