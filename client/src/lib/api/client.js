import axios from "axios";
import { auth } from "../firebase";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.warn("[API] Could not get Firebase token:", err.message);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/me")
    ) {
      originalRequest._retry = true;
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {}
    }

    const apiError = new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred",
    );
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    apiError.errors = error.response?.data?.errors;

    return Promise.reject(apiError);
  },
);

export default apiClient;
