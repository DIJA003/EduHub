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
  approve: (id) => api.patch(`/admin/materials/${id}/approve`, {}),
  // FIX: was api.patch with wrong method; admin reject uses PATCH not DELETE
  reject: (id) => api.patch(`/admin/materials/${id}/reject`, {}),
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

// ── History logs ──────────────────────────────────────────────────────────────
export const logsApi = {
  getLogs: (params = {}) => {
    // Filter out undefined/empty values before building query string
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );
    const qs = new URLSearchParams(clean).toString();
    return api.get(`/admin/logs${qs ? "?" + qs : ""}`);
  },
  getById: (id) => api.get(`/admin/logs/${id}`),
};

// ── Mentor ────────────────────────────────────────────────────────────────────
export const mentorApi = {
  uploadMaterial: (data) => api.post("/mentor/materials/upload", data),
  getPendingMaterials: () => api.get("/mentor/materials/pending"),
  getMyMaterials: () => api.get("/mentor/materials/my-courses"),
  // FIX: both approve and reject are now PATCH
  approveMaterial: (id, data) =>
    api.patch(`/mentor/materials/${id}/approve`, data || {}),
  rejectMaterial: (id, data) =>
    api.patch(`/mentor/materials/${id}/reject`, data || {}),
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

// ── Enrollment (admin) ────────────────────────────────────────────────────────
export const enrollmentApi = {
  // admin
  getStudents: () => api.get("/admin/enrollments/students"),
  getAllEnrollments: () => api.get("/admin/enrollments/all"),
  getCourses: (showDeleted = false) =>
    api.get(`/admin/courses?showDeleted=${showDeleted}`),
  enroll: (studentId, courseId) =>
    api.post("/admin/enrollments", { studentId, courseId }),
  unenroll: (studentId, courseId) =>
    api.delete(`/admin/enrollments/${studentId}/${courseId}`),
  // mentor
  mentorStudents: () => api.get("/mentor/enrollable-students"),
  mentorCourses: () => api.get("/mentor/my-courses"),
  mentorEnroll: (studentId, courseId) =>
    api.post("/mentor/enrollments", { studentId, courseId }),
  mentorUnenroll: (studentId, courseId) =>
    api.delete(`/mentor/enrollments/${studentId}/${courseId}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  deleteOne: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications/delete-all"),
};

// ── Academic Years ────────────────────────────────────────────────────────────
export const academicYearsApi = {
  getAll: () => api.get("/academic-years"),
  getByCollege: (colId) => api.get(`/academic-years/by-college/${colId}`),
  getColleges: () => api.get("/academic-years/colleges"),
};

// ── Student materials ─────────────────────────────────────────────────────────
export const studentMaterialsApi = {
  getAll: () => api.get("/users/materials"),
  create: (data) => api.post("/users/materials", data),
  remove: (id) => api.delete(`/users/materials/${id}`),
};

// ── Student enrollments (CourseContext) ───────────────────────────────────────
export const enrollmentApi2 = {
  getAll: () => api.get("/users/enrollments"),
  enroll: (courseId) => api.post(`/users/enrollments/${courseId}`),
  unenroll: (courseId) => api.delete(`/users/enrollments/${courseId}`),
  updateProgress: (courseId, data) =>
    api.patch(`/users/enrollments/${courseId}/progress`, data),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  update: (data) => api.put("/users/profile", data),
};

// ── Course catalog (public per year) ─────────────────────────────────────────
export const courseCatalogApi = {
  getByYear: (yearId) => api.get(`/courses/year/${yearId}`),
};

// ── Mentor review ─────────────────────────────────────────────────────────────
export const mentorReviewApi = {
  getPending: () => api.get("/mentor/materials/review"),
  approve: (id, feedback) =>
    api.patch(`/mentor/materials/${id}/approve`, { feedback }),
  reject: (id, feedback) =>
    api.patch(`/mentor/materials/${id}/reject`, { feedback }),
};
