import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "../../../lib/api/enrollments.api";
import { toast } from "../../../hooks/useToast";

export const ENROLLMENT_KEYS = {
  all: ["enrollments"],
  my: ["enrollments", "my"],
  list: (params) => ["enrollments", "list", params],
};

export const useMyEnrollments = () =>
  useQuery({
    queryKey: ENROLLMENT_KEYS.my,
    queryFn: () => enrollmentsApi.getMy().then((r) => r.data),
  });

export const useEnroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentsApi.enroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my });
      toast.success("Enrolled successfully");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useUnenroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollmentsApi.unenroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my });
      toast.success("Unenrolled from course");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useUpdateProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, ...data }) =>
      enrollmentsApi.updateProgress(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my });
    },
  });
};
