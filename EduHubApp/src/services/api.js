import { auth } from "./firebase";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.12:8000/api";

async function getToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.warn("[api] getToken error:", err.message);
    return null;
  }
}

async function request(method, path, body, retry = true) {
  const headers = { "Content-Type": "application/json" };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network error — check your connection");
  }

  if (res.status === 401 && retry) {
    const fresh = await getToken(true);
    if (fresh) {
      headers.Authorization = `Bearer ${fresh}`;
      try {
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const retryData = await retryRes.json().catch(() => ({}));
        if (!retryRes.ok) throw new Error(retryData.message || `Request failed (${retryRes.status})`);
        return retryData;
      } catch (err) { throw err; }
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get:    (path)       => request("GET",    path),
  post:   (path, body) => request("POST",   path, body),
  put:    (path, body) => request("PUT",    path, body),
  patch:  (path, body) => request("PATCH",  path, body),
  delete: (path)       => request("DELETE", path),
};

// ─── Named exports used by EduHubApp pages ────────────────────────────────────

export const collegesApi = {
  getAll:  (showDeleted = false) => api.get(`/admin/colleges?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/admin/colleges", data),
  update:  (id, data)  => api.put(`/admin/colleges/${id}`, data),
  remove:  (id)        => api.delete(`/admin/colleges/${id}`),
  restore: (id)        => api.patch(`/admin/colleges/${id}/restore`),
};

export const coursesApi = {
  getAll:  (showDeleted = false) => api.get(`/admin/courses?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/admin/courses", data),
  update:  (id, data)  => api.put(`/admin/courses/${id}`, data),
  remove:  (id)        => api.delete(`/admin/courses/${id}`),
  restore: (id)        => api.patch(`/admin/courses/${id}/restore`),
};

export const materialsApi = {
  getAll:  (showDeleted = false) => api.get(`/admin/materials?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/admin/materials", data),
  update:  (id, data)  => api.put(`/admin/materials/${id}`, data),
  remove:  (id)        => api.delete(`/admin/materials/${id}`),
  restore: (id)        => api.patch(`/admin/materials/${id}/restore`),
  approve: (id)        => api.patch(`/admin/materials/${id}/approve`, {}),
  reject:  (id)        => api.patch(`/admin/materials/${id}/reject`, {}),
};

export const adminUsersApi = {
  getAll:  (showDeleted = false) => api.get(`/admin/users?showDeleted=${showDeleted}`),
  create:  (data)      => api.post("/admin/users", data),
  update:  (id, data)  => api.put(`/admin/users/${id}`, data),
  remove:  (id)        => api.delete(`/admin/users/${id}`),
  restore: (id)        => api.patch(`/admin/users/${id}/restore`),
};

export const dashboardApi = {
  getStats:    () => api.get("/admin/dashboard/stats"),
  getActivity: () => api.get("/admin/dashboard/activity"),
};

export const logsApi = {
  getLogs: (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null));
    const qs = new URLSearchParams(clean).toString();
    return api.get(`/admin/logs${qs ? "?" + qs : ""}`);
  },
  getById: (id) => api.get(`/admin/logs/${id}`),
};

export const mentorApi = {
  uploadMaterial:     (data)      => api.post("/mentor/materials/upload", data),
  getPendingMaterials: ()          => api.get("/mentor/materials/pending"),
  getMyMaterials:     ()          => api.get("/mentor/materials/my-courses"),
  approveMaterial:    (id, data)  => api.patch(`/mentor/materials/${id}/approve`, data || {}),
  rejectMaterial:     (id, data)  => api.patch(`/mentor/materials/${id}/reject`, data || {}),
  updateMaterial:     (id, data)  => api.patch(`/mentor/materials/${id}`, data),
  deleteMaterial:     (id)        => api.delete(`/mentor/materials/${id}`),
  assignStudent:      (courseId, studentId) => api.post(`/mentor/courses/${courseId}/students/${studentId}`, {}),
  getDashboardStats:  ()          => api.get("/mentor/dashboard/stats"),
  getStudents:        ()          => api.get("/mentor/students"),
};

export const studentApi = {
  getSavedCourses: () => api.get("/users/dashboard/courses"),
  saveCourse:      (courseId) => api.post(`/users/courses/${courseId}/save`),
  unsaveCourse:    (courseId) => api.delete(`/users/courses/${courseId}/unsave`),
};

export const enrollmentApi = {
  getStudents:      () => api.get("/admin/enrollments/students"),
  getAllEnrollments: () => api.get("/admin/enrollments/all"),
  getCourses:       (showDeleted = false) => api.get(`/admin/courses?showDeleted=${showDeleted}`),
  enroll:           (studentId, courseId) => api.post("/admin/enrollments", { studentId, courseId }),
  unenroll:         (studentId, courseId) => api.delete(`/admin/enrollments/${studentId}/${courseId}`),
  mentorStudents:   () => api.get("/mentor/enrollable-students"),
  mentorCourses:    () => api.get("/mentor/my-courses"),
  mentorEnroll:     (studentId, courseId) => api.post("/mentor/enrollments", { studentId, courseId }),
  mentorUnenroll:   (studentId, courseId) => api.delete(`/mentor/enrollments/${studentId}/${courseId}`),
};

export const notificationsApi = {
  getAll:    () => api.get("/notifications"),
  markRead:  (id) => api.patch(`/notifications/${id}/read`),
  deleteOne: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete("/notifications/delete-all"),
};

export const academicYearsApi = {
  getAll:       () => api.get("/academic-years"),
  getByCollege: (colId) => api.get(`/academic-years/by-college/${colId}`),
  getColleges:  () => api.get("/academic-years/colleges"),
};

export const studentMaterialsApi = {
  getAll:  () => api.get("/users/materials"),
  create:  (data) => api.post("/users/materials", data),
  remove:  (id) => api.delete(`/users/materials/${id}`),
};

export const enrollmentApi2 = {
  getAll:         () => api.get("/users/enrollments"),
  enroll:         (courseId) => api.post(`/users/enrollments/${courseId}`),
  unenroll:       (courseId) => api.delete(`/users/enrollments/${courseId}`),
  updateProgress: (courseId, data) => api.patch(`/users/enrollments/${courseId}/progress`, data),
};

export const profileApi = {
  update: (data) => api.put("/users/profile", data),
};

export const courseCatalogApi = {
  getByYear: (yearId) => api.get(`/courses/year/${yearId}`),
};

export const mentorReviewApi = {
  getPending: ()               => api.get("/mentor/materials/review"),
  approve:    (id, feedback)   => api.patch(`/mentor/materials/${id}/approve`, { feedback }),
  reject:     (id, feedback)   => api.patch(`/mentor/materials/${id}/reject`, { feedback }),
};

export const uploadApi = {
  getUploadUrl:  (data) => api.post("/upload/signed-url", data),
  confirmUpload: (data) => api.post("/upload/confirm", data),
};

// ─── endpoints object — your branch's style, kept for AuthContext ─────────────
export const endpoints = {
  auth: {
    verifyEmail:    (email)   => api.post("/auth/verify-email", { email }),
    loginProfile:   ()        => api.get("/users/login"),
    registerDbUser: (payload) => api.post("/users/register", payload),
  },
  admin: {
    dashboardStats:    () => api.get("/admin/dashboard/stats"),
    dashboardActivity: () => api.get("/admin/dashboard/activity"),
    colleges:  collegesApi,
    courses:   coursesApi,
    materials: materialsApi,
    users:     adminUsersApi,
  },
  mentor: {
    uploadMaterial:     (data)     => mentorApi.uploadMaterial(data),
    pendingMaterials:   ()         => mentorApi.getPendingMaterials(),
    myMaterials:        ()         => mentorApi.getMyMaterials(),
    approveMaterial:    (id, data) => mentorApi.approveMaterial(id, data),
    rejectMaterial:     (id)       => mentorApi.rejectMaterial(id),
    updateMaterial:     (id, data) => mentorApi.updateMaterial(id, data),
    deleteMaterial:     (id)       => mentorApi.deleteMaterial(id),
  },
  student: {
    dashboardCourses: () => studentApi.getSavedCourses(),
    saveCourse:       (courseId) => studentApi.saveCourse(courseId),
    unsaveCourse:     (courseId) => studentApi.unsaveCourse(courseId),
  },
  years: {
    all: () => academicYearsApi.getAll(),
  },
};

export default api;
