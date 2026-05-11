import apiClient from "./client";

export const settingsApi = {
  getAll: (params) => apiClient.get("/settings", { params }).then((r) => r.data),
  getPublic: () => apiClient.get("/settings/public").then((r) => r.data),
  getByKey: (key) => apiClient.get(`/settings/${key}`).then((r) => r.data),
  update: (key, data) => apiClient.put(`/settings/${key}`, data).then((r) => r.data),
  bulkUpdate: (data) => apiClient.put("/settings", data).then((r) => r.data),
  reset: (key) => apiClient.post(`/settings/${key}/reset`).then((r) => r.data),
};
