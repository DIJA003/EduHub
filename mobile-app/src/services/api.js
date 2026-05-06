import { auth } from "./firebase";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:8000/api";

async function getToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

async function request(method, path, body, retry = true) {
  const headers = { "Content-Type": "application/json" };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    const fresh = await getToken(true);
    if (fresh) {
      headers.Authorization = `Bearer ${fresh}`;
      return request(method, path, body, false);
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export const endpoints = {
  auth: {
    verifyEmail: (email) => api.post("/auth/verify-email", { email }),
    loginProfile: () => api.get("/users/login"),
    registerDbUser: (payload) => api.post("/users/register", payload),
  },
  admin: {
    dashboardStats: () => api.get("/admin/dashboard/stats"),
    dashboardActivity: () => api.get("/admin/dashboard/activity"),
    colleges: {
      getAll: () => api.get("/admin/colleges"),
      create: (data) => api.post("/admin/colleges", data),
      update: (id, data) => api.put(`/admin/colleges/${id}`, data),
      remove: (id) => api.delete(`/admin/colleges/${id}`),
    },
    courses: {
      getAll: () => api.get("/admin/courses"),
      create: (data) => api.post("/admin/courses", data),
      update: (id, data) => api.put(`/admin/courses/${id}`, data),
      remove: (id) => api.delete(`/admin/courses/${id}`),
    },
    materials: {
      getAll: () => api.get("/admin/materials"),
      create: (data) => api.post("/admin/materials", data),
      update: (id, data) => api.put(`/admin/materials/${id}`, data),
      remove: (id) => api.delete(`/admin/materials/${id}`),
    },
    users: {
      getAll: () => api.get("/admin/users"),
      update: (id, data) => api.put(`/admin/users/${id}`, data),
      remove: (id) => api.delete(`/admin/users/${id}`),
    },
  },
  mentor: {
    uploadMaterial: (data) => api.post("/mentor/materials/upload", data),
    pendingMaterials: () => api.get("/mentor/materials/pending"),
    myMaterials: () => api.get("/mentor/materials/my-courses"),
    approveMaterial: (id, data) => api.patch(`/mentor/materials/${id}/approve`, data),
    rejectMaterial: (id) => api.delete(`/mentor/materials/${id}/reject`),
    updateMaterial: (id, data) => api.patch(`/mentor/materials/${id}`, data),
    deleteMaterial: (id) => api.delete(`/mentor/materials/${id}`),
  },
  student: {
    dashboardCourses: () => api.get("/users/dashboard/courses"),
    saveCourse: (courseId) => api.post(`/users/courses/${courseId}/save`, {}),
    unsaveCourse: (courseId) => api.delete(`/users/courses/${courseId}/unsave`),
  },
  years: {
    all: () => api.get("/academic-years"),
  },
};
