import api from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  verifyEmailExists: (email) => api.post("/auth/verify-email", { email }),
  logPasswordChange: () => api.post("/auth/password-changed"),
};
