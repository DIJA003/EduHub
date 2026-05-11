import api from "./client";

export const enrollmentsApi = {
  getMyEnrollments: () => api.get("/enrollments/my").then((r) => r.data),
  /** @deprecated use getMyEnrollments — kept for older call sites */
  getMy: () => api.get("/enrollments/my").then((r) => r.data),

  enroll: (courseId) => api.post(`/enrollments/${courseId}`).then((r) => r.data),

  unenroll: (courseId) => api.delete(`/enrollments/${courseId}`).then((r) => r.data),

  updateProgress: (courseId, data) =>
    api.patch(`/enrollments/${courseId}/progress`, data).then((r) => r.data),

  getAll: (params) => api.get("/enrollments", { params }).then((r) => r.data),

  adminEnroll: (data) => api.post("/enrollments/admin", data).then((r) => r.data),

  adminUnenroll: (studentId, courseId) =>
    api.delete(`/enrollments/admin/${studentId}/${courseId}`).then((r) => r.data),

  // Mentor enrollment management
  mentorEnroll: (data) => api.post("/enrollments/mentor", data).then((r) => r.data),

  mentorUnenroll: (studentId, courseId) =>
    api.delete(`/enrollments/mentor/${studentId}/${courseId}`).then((r) => r.data),
};
