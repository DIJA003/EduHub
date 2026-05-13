/**
 * src/services/api.js
 * Connected to: https://eduhub-production-c198.up.railway.app/api
 *
 * Token expiry fix:
 *  - Always force-refresh the token on 401 before retrying
 *  - Pre-emptively refresh if token is close to expiry (< 5 min left)
 */
import { auth } from "./firebase";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://eduhub-production-c198.up.railway.app/api";

// ─── Token management ─────────────────────────────────────────────────────────
async function getToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    // Pre-emptively force refresh if token expires in less than 5 minutes
    if (!forceRefresh) {
      const tokenResult = await user.getIdTokenResult();
      const expiryTime  = new Date(tokenResult.expirationTime).getTime();
      const now         = Date.now();
      const fiveMin     = 5 * 60 * 1000;
      if (expiryTime - now < fiveMin) {
        forceRefresh = true;
      }
    }
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.warn("[api] getToken error:", err.message);
    return null;
  }
}

// ─── Core request ─────────────────────────────────────────────────────────────
async function request(method, path, body, retry = true) {
  const headers = { "Content-Type": "application/json" };
  const token   = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — check your connection and try again");
  }

  // ── 401 handling: force-refresh token and retry once ─────────────────────
  if (res.status === 401 && retry) {
    console.warn("[api] 401 received — force-refreshing token and retrying");
    try {
      const freshToken = await getToken(true); // always force refresh on 401
      if (freshToken) {
        headers.Authorization = `Bearer ${freshToken}`;
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const retryData = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok) {
          throw new Error(retryData.message || `Request failed (${retryRes.status})`);
        }
        // Unwrap { success, data } envelope if present
        return retryData?.data !== undefined ? retryData.data : retryData;
      }
    } catch (err) {
      throw err;
    }
    throw new Error("Session expired — please log in again");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  // Unwrap { success: true, data: {...} } envelope from this backend
  return data?.data !== undefined ? data.data : data;
}

// ─── Base API methods ─────────────────────────────────────────────────────────
export const api = {
  get:    (path)        => request("GET",    path),
  post:   (path, body)  => request("POST",   path, body),
  put:    (path, body)  => request("PUT",    path, body),
  patch:  (path, body)  => request("PATCH",  path, body),
  delete: (path)        => request("DELETE", path),
};

// ─── Auth (/api/auth/*) ───────────────────────────────────────────────────────
export const authApi = {
  getMe:           ()       => api.get("/auth/me"),
  register:        (data)   => api.post("/auth/register", data),
  verifyEmail:     (email)  => api.post("/auth/verify-email", { email }),
  passwordChanged: ()       => api.post("/auth/password-changed"),
};

// ─── Users (/api/users/*) ─────────────────────────────────────────────────────
export const profileApi = {
  get:    ()       => api.get("/users/profile"),
  update: (data)   => api.put("/users/profile", data),
};

export const adminUsersApi = {
  getAll:  (showDeleted = false) => api.get(`/users?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/users", data),
  update:  (id, data)  => api.put(`/users/${id}`, data),
  remove:  (id)        => api.delete(`/users/${id}`),
  restore: (id)        => api.patch(`/users/${id}/restore`),
};

// ─── Courses (/api/courses/*) ─────────────────────────────────────────────────
export const coursesApi = {
  getAll:    ()           => api.get("/courses"),
  getByYear: (yearId)     => api.get(`/courses/year/${yearId}`),
  getById:   (id)         => api.get(`/courses/${id}`),
  create:    (data)       => api.post("/courses", data),
  update:    (id, data)   => api.put(`/courses/${id}`, data),
  remove:    (id)         => api.delete(`/courses/${id}`),
  restore:   (id)         => api.patch(`/courses/${id}/restore`),
};

export const courseCatalogApi = {
  getByYear: (yearId) => api.get(`/courses/year/${yearId}`),
};

// ─── Enrollments (/api/enrollments/*) ────────────────────────────────────────
export const enrollmentApi2 = {
  getAll:         ()              => api.get("/enrollments/my"),
  enroll:         (courseId)      => api.post(`/enrollments/${courseId}`),
  unenroll:       (courseId)      => api.delete(`/enrollments/${courseId}`),
  updateProgress: (courseId, data) => api.patch(`/enrollments/${courseId}/progress`, data),
};

export const enrollmentApi = {
  getAllEnrollments: () => api.get("/enrollments"),
  enroll:           (studentId, courseId) => api.post("/enrollments/admin", { studentId, courseId }),
  unenroll:         (studentId, courseId) => api.delete(`/enrollments/admin/${studentId}/${courseId}`),
  mentorStudents:   () => api.get("/mentor/enrollable-students"),
  mentorCourses:    () => api.get("/mentor/my-courses"),
  mentorEnroll:     (studentId, courseId) => api.post("/enrollments/mentor", { studentId, courseId }),
  mentorUnenroll:   (studentId, courseId) => api.delete(`/enrollments/mentor/${studentId}/${courseId}`),
};

// ─── Materials (/api/materials/*) ─────────────────────────────────────────────
export const materialsApi = {
  getAll:  (showDeleted = false) => api.get(`/materials?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/materials", data),
  update:  (id, data)  => api.put(`/materials/${id}`, data),
  remove:  (id)        => api.delete(`/materials/${id}`),
  restore: (id)        => api.patch(`/materials/${id}/restore`),
  approve: (id)        => api.patch(`/materials/${id}/approve`, {}),
  reject:  (id)        => api.patch(`/materials/${id}/reject`, {}),
};

export const studentMaterialsApi = {
  getAll: () => api.get("/materials"),
  create: (data) => api.post("/materials", data),
  remove: (id)   => api.delete(`/materials/${id}`),
};

// ─── Mentor (/api/mentor/*) ───────────────────────────────────────────────────
export const mentorApi = {
  uploadMaterial:      (data)      => api.post("/materials", data),
  getPendingMaterials: ()          => api.get("/materials?status=pending"),
  getMyMaterials:      ()          => api.get("/mentor/my-courses"),
  approveMaterial:     (id, data)  => api.patch(`/materials/${id}/approve`, data || {}),
  rejectMaterial:      (id, data)  => api.patch(`/materials/${id}/reject`, data || {}),
  updateMaterial:      (id, data)  => api.patch(`/materials/${id}`, data),
  deleteMaterial:      (id)        => api.delete(`/materials/${id}`),
  getDashboardStats:   ()          => api.get("/mentor/dashboard/stats"),
  getStudents:         ()          => api.get("/mentor/students"),
};

export const mentorReviewApi = {
  getPending: ()              => api.get("/materials?status=pending"),
  approve:    (id, feedback)  => api.patch(`/materials/${id}/approve`, { feedback }),
  reject:     (id, feedback)  => api.patch(`/materials/${id}/reject`, { feedback }),
};

// ─── Dashboard (/api/admin/stats, /api/dashboard/*) ──────────────────────────
export const dashboardApi = {
  getStats:    () => api.get("/admin/stats"),
  getActivity: () => api.get("/dashboard/activity"),
};

// ─── Academic Years (/api/academic-years/*) ───────────────────────────────────
export const academicYearsApi = {
  getAll:       ()       => api.get("/academic-years"),
  getByCollege: (colId)  => api.get(`/academic-years?collegeId=${colId}`),
  getColleges:  ()       => api.get("/faculties"),
};

// ─── Colleges / Faculties (/api/faculties/*) ──────────────────────────────────
export const collegesApi = {
  getAll:  (showDeleted = false) => api.get(`/faculties?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/faculties", data),
  update:  (id, data)  => api.put(`/faculties/${id}`, data),
  remove:  (id)        => api.delete(`/faculties/${id}`),
  restore: (id)        => api.patch(`/faculties/${id}/restore`),
};

// ─── Notifications (/api/notifications/*) ────────────────────────────────────
export const notificationsApi = {
  getAll:    ()    => api.get("/notifications"),
  markRead:  (id)  => api.patch(`/notifications/${id}/read`),
  deleteOne: (id)  => api.delete(`/notifications/${id}`),
  deleteAll: ()    => api.delete("/notifications"),
};

// ─── Logs (/api/logs/*) ───────────────────────────────────────────────────────
export const logsApi = {
  getLogs: (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
    );
    const qs = new URLSearchParams(clean).toString();
    return api.get(`/logs${qs ? "?" + qs : ""}`);
  },
  getById: (id) => api.get(`/logs/${id}`),
};

// ─── Uploads (/api/uploads/*) ─────────────────────────────────────────────────
export const uploadApi = {
  getUploadUrl:  (data) => api.post("/uploads/signed-url", data),
  confirmUpload: (data) => api.post("/uploads/confirm", data),
};

// ─── Student shortcuts ────────────────────────────────────────────────────────
export const studentApi = {
  getSavedCourses: () => api.get("/enrollments/my"),
  saveCourse:      (courseId) => api.post(`/enrollments/${courseId}`),
  unsaveCourse:    (courseId) => api.delete(`/enrollments/${courseId}`),
};

// ─── endpoints object — used by AuthContext + pages ───────────────────────────
export const endpoints = {
  auth: {
    verifyEmail:    (email)   => authApi.verifyEmail(email),
    loginProfile:   ()        => authApi.getMe(),           // GET /auth/me
    registerDbUser: (payload) => authApi.register(payload), // POST /auth/register
  },
  admin: {
    dashboardStats:    () => dashboardApi.getStats(),
    dashboardActivity: () => dashboardApi.getActivity(),
    colleges:  collegesApi,
    courses:   coursesApi,
    materials: materialsApi,
    users:     adminUsersApi,
  },
  mentor: {
    uploadMaterial:   (data)      => mentorApi.uploadMaterial(data),
    pendingMaterials: ()          => mentorApi.getPendingMaterials(),
    myMaterials:      ()          => mentorApi.getMyMaterials(),
    approveMaterial:  (id, data)  => mentorApi.approveMaterial(id, data),
    rejectMaterial:   (id)        => mentorApi.rejectMaterial(id),
    updateMaterial:   (id, data)  => mentorApi.updateMaterial(id, data),
    deleteMaterial:   (id)        => mentorApi.deleteMaterial(id),
  },
  student: {
    dashboardCourses: () => api.get("/enrollments/my"),
    saveCourse:       (courseId) => api.post(`/enrollments/${courseId}`),
    unsaveCourse:     (courseId) => api.delete(`/enrollments/${courseId}`),
  },
  years: {
    all: () => academicYearsApi.getAll(),
  },
};

export default api;