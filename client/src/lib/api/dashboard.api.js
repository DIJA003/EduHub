import api from "./client";

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getActivity: () => api.get("/dashboard/activity"),
};
