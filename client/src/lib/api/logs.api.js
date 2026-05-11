import api from "./client";

export const logsApi = {
  getAll: (params) => api.get("/logs", { params }).then((r) => r.data),
  getById: (id) => api.get(`/logs/${id}`).then((r) => r.data),
  getMentorLogs: (params) => api.get("/logs/mentor", { params }).then((r) => r.data),
};
