import api from "./client";

export const usersApi = {
  getAll: (params) => api.get("/users", { params }),

  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),

  update: (id, data) => api.put(`/users/${id}`, data),

  remove: (id) => api.delete(`/users/${id}`),

  restore: (id) => api.patch(`/users/${id}/restore`),

  updateProfile: (data) => api.put("/users/profile", data),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/uploads/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
