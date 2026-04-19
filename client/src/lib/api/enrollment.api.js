import api from "./client";

export const enrollmentsApi = {
  // Student
  getMy: () => api.get("/enrollments/my"),
  enroll: (courseId) => api.post(`/enrollments/${courseId}`),
  unenroll: (courseId) => api.delete(`/enrollments/${courseId}`),
  updateProgress: (courseId, data) =>
    api.patch(`/enrollments/${courseId}/progress`, data),

  // Admin
  getAll: (params) => api.get("/enrollments", { params }),
  adminEnroll: (data) => api.post("/enrollments/admin", data),
  adminUnenroll: (studentId, courseId) =>
    api.delete(`/enrollments/admin/${studentId}/${courseId}`),
};
