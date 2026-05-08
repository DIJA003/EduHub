import apiClient from "../lib/api/client";

export const profileApi = {
  update: (data) => apiClient.put("/users/profile", data),
  get: () => apiClient.get("/auth/me"),
};

export const enrollmentApi2 = {
  getAll: () => apiClient.get("/enrollments/my"),
};