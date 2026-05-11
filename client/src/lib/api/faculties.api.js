import apiClient from "./client";

export const facultiesApi = {
  getAll: (params) => apiClient.get("/faculties", { params }).then((r) => r.data),
  getPublic: () => apiClient.get("/faculties/public").then((r) => r.data),
  getById: (id) => apiClient.get(`/faculties/${id}`).then((r) => r.data),
  /** Faculty + program scoped academic years (includes fallbacks from program length / courses). */
  getStudentAcademicYears: (id) =>
    apiClient.get(`/faculties/${id}/academic-years`).then((r) => r.data),
  create: (data) => apiClient.post("/faculties", data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/faculties/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/faculties/${id}`).then((r) => r.data),
};
