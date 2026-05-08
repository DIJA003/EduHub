import apiClient from "../lib/api/client";

export const profileApi = {
  update: (data) => apiClient.put("/users/profile", data),
  get: () => apiClient.get("/auth/me"),
};

export const enrollmentApi2 = {
  getAll: () => apiClient.get("/enrollments/my"),
};

export const avatarApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post("/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};