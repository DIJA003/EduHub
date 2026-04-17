import { auth } from "./firebase";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

async function getToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

async function request(method, path, body, retry = true) {
  const headers = { "Content-Type": "application/json" };

  const token = await getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    const freshToken = await getToken(true);
    if (freshToken) {
      headers["Authorization"] = `Bearer ${freshToken}`;
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const retryData = await retryRes.json().catch(() => ({}));
      if (!retryRes.ok)
        throw new Error(
          retryData.message || `Request failed (${retryRes.status})`,
        );
      return retryData;
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      data.message || data.error || `Request failed (${res.status})`,
    );
  return data;
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

// ── Colleges ──────────────────────────────────────────────────────────────────
export const collegesApi = {
  getAll: (showDeleted = false) =>
    api.get(`/admin/colleges?showDeleted=${showDeleted}`),
  create: (data) => api.post("/admin/colleges", data),
  update: (id, data) => api.put(`/admin/colleges/${id}`, data),
  remove: (id) => api.delete(`/admin/colleges/${id}`),
  restore: (id) => api.patch(`/admin/colleges/${id}/restore`),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesApi = {
  getAll: (showDeleted = false) =>
    api.get(`/admin/courses?showDeleted=${showDeleted}`),
  create: (data) => api.post("/admin/courses", data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  remove: (id) => api.delete(`/admin/courses/${id}`),
  restore: (id) => api.patch(`/admin/courses/${id}/restore`),
};

// ── Materials ─────────────────────────────────────────────────────────────────
export const materialsApi = {
  getAll: (showDeleted = false) =>
    api.get(`/admin/materials?showDeleted=${showDeleted}`),
  create: (data) => api.post("/admin/materials", data),
  update: (id, data) => api.put(`/admin/materials/${id}`, data),
  remove: (id) => api.delete(`/admin/materials/${id}`),
  restore: (id) => api.patch(`/admin/materials/${id}/restore`),
};

// ── Admin users ───────────────────────────────────────────────────────────────
export const adminUsersApi = {
  getAll: (showDeleted = false) =>
    api.get(`/admin/users?showDeleted=${showDeleted}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  remove: (id) => api.delete(`/admin/users/${id}`),
  restore: (id) => api.patch(`/admin/users/${id}/restore`),
  create: (data) => api.post("/admin/users", data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/admin/dashboard/stats"),
  getActivity: () => api.get("/admin/dashboard/activity"),
};

// ── History logs ──────────────────────────────────────────────────────
export const logsApi = {
  getLogs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
      ),
    ).toString();
    return api.get(`/admin/logs${qs ? "?" + qs : ""}`);
  },
};

// ── Mentor ────────────────────────────────────────────────────────────────────
export const mentorApi = {
  uploadMaterial: (data) => api.post("/mentor/materials/upload", data),
  getPendingMaterials: () => api.get("/mentor/materials/pending"),
  getMyMaterials: () => api.get("/mentor/materials/my-courses"),
  approveMaterial: (id, data) =>
    api.patch(`/mentor/materials/${id}/approve`, data),
  rejectMaterial: (id) => api.delete(`/mentor/materials/${id}/reject`),
  updateMaterial: (id, data) => api.patch(`/mentor/materials/${id}`, data),
  deleteMaterial: (id) => api.delete(`/mentor/materials/${id}`),
  assignStudent: (courseId, studentId) =>
    api.post(`/mentor/courses/${courseId}/students/${studentId}`, {}),
  getDashboardStats: () => api.get("/mentor/dashboard/stats"),
  getStudents: () => api.get("/mentor/students"),
};

// ── Student ───────────────────────────────────────────────────────────────────
export const studentApi = {
  getSavedCourses: () => api.get("/users/dashboard/courses"),
  saveCourse: (courseId) => api.post(`/users/courses/${courseId}/save`),
  unsaveCourse: (courseId) => api.delete(`/users/courses/${courseId}/unsave`),
};

// ── Enrollment ────────────────────────────────────────────────────────────────
export const enrollmentApi = {
  getStudents: (courseId) => api.get(`/admin/courses/${courseId}/students`),
  addStudent: (courseId, data) =>
    api.post(`/admin/courses/${courseId}/students`, data),
  removeStudent: (courseId, studentId) =>
    api.delete(`/admin/courses/${courseId}/students/${studentId}`),
  getStudentCourses: (studentId) =>
    api.get(`/admin/students/${studentId}/courses`),
};
// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  deleteOne: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications/delete-all"),
};
