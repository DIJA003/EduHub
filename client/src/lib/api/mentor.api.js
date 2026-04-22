import api from "./client";

export const mentorApi = {
  getMyCourses: () => api.get("/mentor/my-courses"),

  getEnrollableStudents: () => api.get("/mentor/enrollable-students"),

  getStudents: () => api.get("/mentor/students"),

  getDashboardStats: () => api.get("/mentor/dashboard/stats"),

  enrollStudent: (data) => api.post("/mentor/enrollments", data),

  unenrollStudent: (studentId, courseId) =>
    api.delete(`/mentor/enrollments/${studentId}/${courseId}`),
};
