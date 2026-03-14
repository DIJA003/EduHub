import { auth } from './firebase';

const BASE_URL = 'http://localhost:8000/api';

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };

  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Token error:', err);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data;
}

const api = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  put:    (path, body) => request('PUT',    path, body),
  delete: (path)       => request('DELETE', path),
};

export const collegesApi = {
  getAll:  ()         => api.get('/admin/colleges'),
  create:  (data)     => api.post('/admin/colleges', data),
  update:  (id, data) => api.put(`/admin/colleges/${id}`, data),
  remove:  (id)       => api.delete(`/admin/colleges/${id}`),
};

export const coursesApi = {
  getAll:  ()         => api.get('/admin/courses'),
  create:  (data)     => api.post('/admin/courses', data),
  update:  (id, data) => api.put(`/admin/courses/${id}`, data),
  remove:  (id)       => api.delete(`/admin/courses/${id}`),
};

export const enrollmentApi = {
  getStudents:   (courseId)            => api.get(`/admin/courses/${courseId}/students`),
  addStudent:    (courseId, data)      => api.post(`/admin/courses/${courseId}/students`, data),
  removeStudent: (courseId, studentId) => api.delete(`/admin/courses/${courseId}/students/${studentId}`),
  getStudentCourses: (studentId)       => api.get(`/admin/students/${studentId}/courses`),
};

export const materialsApi = {
  getAll:  ()         => api.get('/admin/materials'),
  create:  (data)     => api.post('/admin/materials', data),
  update:  (id, data) => api.put(`/admin/materials/${id}`, data),
  remove:  (id)       => api.delete(`/admin/materials/${id}`),
};

export const adminUsersApi = {
  getAll:  ()         => api.get('/admin/users'),
  update:  (id, data) => api.put(`/admin/users/${id}`, data),
  remove:  (id)       => api.delete(`/admin/users/${id}`),
};

export const dashboardApi = {
  getStats:    () => api.get('/admin/dashboard/stats'),
  getActivity: () => api.get('/admin/dashboard/activity'),
};