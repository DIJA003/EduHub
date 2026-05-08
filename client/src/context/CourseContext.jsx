// client/src/context/CourseContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../lib/api/client";

const CourseContext = createContext(null);

export function sumEnrolledCredits(enrolled = []) {
  return enrolled.reduce((sum, c) => sum + (c.credits || 3), 0);
}

const DEFAULT_YEARS = {
  1: {
    meta: { title: "Year One: Freshman Year", description: "Foundational concepts.", status: "In Progress", earnedCredits: 0, totalCredits: 42, unlocked: true },
    enrolled: [],
    available: [],
    plannedCurriculum: [],
  },
  2: {
    meta: { title: "Year Two: Sophomore Year", description: "Core engineering principles.", status: "Locked", earnedCredits: 0, totalCredits: 42, unlocked: false },
    enrolled: [],
    available: [],
    plannedCurriculum: [],
  },
  3: {
    meta: { title: "Year Three: Junior Year", description: "Advanced applications.", status: "Locked", earnedCredits: 0, totalCredits: 42, unlocked: false },
    enrolled: [],
    available: [],
    plannedCurriculum: [],
  },
  4: {
    meta: { title: "Year Four: Senior Year", description: "Capstone and thesis.", status: "Locked", earnedCredits: 0, totalCredits: 42, unlocked: false },
    enrolled: [],
    available: [],
    plannedCurriculum: [],
  },
};

export function CourseProvider({ children }) {
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [currentYearId, setCurrentYearId] = useState("1");
  const [lastCompletedCourse, setLastCompletedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        for (let y = 1; y <= 4; y++) {
          const res = await apiClient.get(`/courses/year/${y}`);
          const courses = res.data?.data || [];
          setYears((prev) => ({
            ...prev,
            [y]: {
              ...prev[y],
              available: courses.map((c) => ({
                id: c._id,
                mongoId: c._id,
                name: c.title,
                code: c.code,
                credits: c.creditHours || 3,
                instructor: c.instructor || "",
                type: "Course",
              })),
            },
          }));
        }
      } catch (err) {
        console.warn("CourseContext: failed to fetch courses", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const enrollCourse = (yearId, course) => {
    setYears((prev) => {
      const year = prev[yearId];
      if (!year) return prev;
      const alreadyEnrolled = year.enrolled.some((c) => c.id === course.id);
      if (alreadyEnrolled) return prev;
      const updatedEnrolled = [
        ...year.enrolled,
        { ...course, progress: 0, nextItem: "Getting Started" },
      ];
      return {
        ...prev,
        [yearId]: {
          ...year,
          enrolled: updatedEnrolled,
          available: year.available.filter((c) => c.id !== course.id),
          meta: {
            ...year.meta,
            earnedCredits: sumEnrolledCredits(updatedEnrolled),
          },
        },
      };
    });
  };

  const undoEnrollment = (yearId, courseId) => {
    setYears((prev) => {
      const year = prev[yearId];
      if (!year) return prev;
      const course = year.enrolled.find((c) => c.id === courseId);
      if (!course) return prev;
      const updatedEnrolled = year.enrolled.filter((c) => c.id !== courseId);
      return {
        ...prev,
        [yearId]: {
          ...year,
          enrolled: updatedEnrolled,
          available: course ? [course, ...year.available] : year.available,
          meta: {
            ...year.meta,
            earnedCredits: sumEnrolledCredits(updatedEnrolled),
          },
        },
      };
    });
  };

  return (
    <CourseContext.Provider
      value={{
        years,
        currentYearId,
        setCurrentYearId,
        enrollCourse,
        undoEnrollment,
        lastCompletedCourse,
        setLastCompletedCourse,
        loading,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}