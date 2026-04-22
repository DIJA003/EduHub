import api from "./client";

export const logsApi = {
  getAll: (params) => api.get("/logs", { params }),

  getById: (id) => api.get(`/logs/${id}`),
};
