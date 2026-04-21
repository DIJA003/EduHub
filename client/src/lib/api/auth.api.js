import api from "./client";
export const authApi = {
  getMe: () => api.get("/auth/me"),

  register: (data) => api.post("/auth/register", data),

  verifyEmailExists: (email) => api.post("/auth/verify-email", { email }),

  logPasswordChange: () => api.post("/auth/password-changed"),
};
