import api from "./client";

export const collegesApi = {
  getAll: (params) => api.get("/colleges", { params }),
  getById: (id) => api.get(`/colleges/${id}`),
  create: (data) => api.post("/colleges", data),
  update: (id, data) => api.put(`/colleges/${id}`, data),
  remove: (id) => api.delete(`/colleges/${id}`),
  restore: (id) => api.patch(`/colleges/${id}/restore`),
};
