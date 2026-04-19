import api from "./client";

export const coursesApi = {
  getAll: (params) => api.get("/courses", { params }),
  getByYear: (yearId) => api.get(`/courses/year/${yearId}`),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  remove: (id) => api.delete(`/courses/${id}`),
  restore: (id) => api.patch(`/courses/${id}/restore`),
};
