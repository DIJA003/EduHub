import api from "./client";

export const academicYear = {
  getAll: () => api.get("/academic-years"),
  getByYear: (year) => api.get(`/academic-years/year/${year}`),
  getById: (id) => api.get(`/academic-years/${id}`),
};
