import apiClient from "./client";

export const programsApi = {
  getAll: (params) => apiClient.get("/programs", { params }).then((r) => r.data),
  getPublic: (params) => apiClient.get("/programs/public", { params }).then((r) => r.data),
  getByFaculty: (facultyId) => apiClient.get(`/programs/by-faculty/${facultyId}`).then((r) => r.data),
  getById: (id) => apiClient.get(`/programs/${id}`).then((r) => r.data),
  getStructure: (id) => apiClient.get(`/programs/structure/${id}`).then((r) => r.data),
  create: (data) => apiClient.post("/programs", data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/programs/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/programs/${id}`).then((r) => r.data),
  restore: (id) => apiClient.patch(`/programs/${id}/restore`).then((r) => r.data),
};
