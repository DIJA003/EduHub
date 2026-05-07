import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "../../../lib/api/courses.api";
import { toast } from "../../../hooks/useToasts";

export const COURSE_KEYS = {
  all: ["courses"],
  list: (params) => ["courses", "list", params],
  byYear: (yearId) => ["courses", "year", yearId],
  detail: (id) => ["courses", "detail", id],
};

export const useCourses = (params = {}) =>
  useQuery({
    queryKey: COURSE_KEYS.list(params),
    queryFn: () => coursesApi.getAll(params).then((r) => r.data),
  });

export const useCoursesByYear = (yearId) =>
  useQuery({
    queryKey: COURSE_KEYS.byYear(yearId),
    queryFn: () => coursesApi.getByYear(yearId).then((r) => r.data),
    staleTime: 1000 * 60 * 10,
    enabled: !!yearId,
  });

export const useCourse = (id) =>
  useQuery({
    queryKey: COURSE_KEYS.detail(id),
    queryFn: () => coursesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_KEYS.all });
      toast.success("Course created successfully");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useUpdateCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => coursesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_KEYS.all });
      toast.success("Course updated");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_KEYS.all });
      toast.success("Course deleted");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useRestoreCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: coursesApi.restore,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COURSE_KEYS.all });
      toast.success("Course restored");
    },
  });
};
