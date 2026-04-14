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

export const collegesApi = {
  getAll: () => api.get("/admin/colleges"),
  create: (data) => api.post("/admin/colleges", data),
  update: (id, data) => api.put(`/admin/colleges/${id}`, data),
  remove: (id) => api.delete(`/admin/colleges/${id}`),
};
export const coursesApi = {
  getAll: () => api.get("/admin/courses"),
  create: (data) => api.post("/admin/courses", data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  remove: (id) => api.delete(`/admin/courses/${id}`),
};
export const materialsApi = {
  getAll: () => api.get("/admin/materials"),
  create: (data) => api.post("/admin/materials", data),
  update: (id, data) => api.put(`/admin/materials/${id}`, data),
  remove: (id) => api.delete(`/admin/materials/${id}`),
};
export const adminUsersApi = {
  getAll: () => api.get("/admin/users"),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  remove: (id) => api.delete(`/admin/users/${id}`),
};
export const dashboardApi = {
  getStats: () => api.get("/admin/dashboard/stats"),
  getActivity: () => api.get("/admin/dashboard/activity"),
};
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
};
export const studentApi = {
  getSavedCourses: () => api.get("/users/dashboard/courses"),
  saveCourse: (courseId) => api.post(`/users/courses/${courseId}/save`),
  unsaveCourse: (courseId) => api.delete(`/users/courses/${courseId}/unsave`),
};
export const enrollmentApi = {
  getStudents: (courseId) => api.get(`/admin/courses/${courseId}/students`),
  addStudent: (courseId, data) =>
    api.post(`/admin/courses/${courseId}/students`, data),
  removeStudent: (courseId, studentId) =>
    api.delete(`/admin/courses/${courseId}/students/${studentId}`),
  getStudentCourses: (studentId) =>
    api.get(`/admin/students/${studentId}/courses`),
};
