import apiClient from "./client";

export const requestsApi = {
  // User endpoints
  getMyRequests: () => apiClient.get("/requests/my"),
  create: (data) => apiClient.post("/requests", data),
  cancel: (id) => apiClient.put(`/requests/${id}/cancel`),

  // Public endpoint (for pre-registration requests)
  createPublic: (data) => apiClient.post("/requests/public", data),

  // Admin endpoints
  getAll: (params) => apiClient.get("/requests", { params }),
  getById: (id) => apiClient.get(`/requests/${id}`),
  review: (id, data) => apiClient.put(`/requests/${id}/review`, data),
};
