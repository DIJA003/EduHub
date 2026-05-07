import api from "./client";

export const materialsApi = {
  getAll: (params) => api.get("/materials", { params }),

  getMy: (params) => api.get("/materials/my", { params }),

  getPending: (params) => api.get("/materials/pending", { params }),

  approve: (id, feedback = "") =>
    api.patch(`/materials/${id}/approve`, { feedback }),

  reject: (id, feedback = "") =>
    api.patch(`/materials/${id}/reject`, { feedback }),

  remove: (id) => api.delete(`/materials/${id}`),
  create: (data) => api.post("/materials", data),
};

export const uploadsApi = {
  getSignedUrl: (data) => api.post("/uploads/signed-url", data),

  confirm: (data) => api.post("/uploads/confirm", data),

  deleteFile: (storagePath) =>
    api.delete("/uploads/file", { data: { storagePath } }),
};
