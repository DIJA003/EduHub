import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "../../../lib/api/enrollments.api";
import { toast } from "../../../hooks/useToasts";

export const ENROLLMENT_KEYS = {
  all: ["enrollments"],
  my: ["enrollments", "my"],
  list: (params) => ["enrollments", "list", params],
};

function normalizeMyEnrollmentsResponse(body) {
  const raw = body?.data ?? body;
  return Array.isArray(raw) ? raw : [];
}

export const useMyEnrollments = () =>
  useQuery({
    queryKey: ENROLLMENT_KEYS.my,
    queryFn: () =>
      enrollmentsApi
        .getMyEnrollments()
        .then((body) => normalizeMyEnrollmentsResponse(body)),
    staleTime: 60_000,
  });

export const useEnroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => enrollmentsApi.enroll(courseId),
    onMutate: async (courseId) => {
      await qc.cancelQueries({ queryKey: ENROLLMENT_KEYS.my });
      const prev = qc.getQueryData(ENROLLMENT_KEYS.my);
      const list = Array.isArray(prev) ? prev : [];
      const sid = String(courseId);
      if (list.some((e) => String(e.courseId ?? e.id) === sid)) {
        return { prev };
      }
      qc.setQueryData(ENROLLMENT_KEYS.my, [
        ...list,
        { courseId, id: courseId },
      ]);
      return { prev };
    },
    onError: (err, _courseId, ctx) => {
      const msg = err.message || "";
      const already =
        err.status === 409 || /already enrolled/i.test(msg);
      if (already) {
        void qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my });
        toast.error(msg || "Already enrolled in this course.");
        return;
      }
      if (ctx?.prev !== undefined) {
        qc.setQueryData(ENROLLMENT_KEYS.my, ctx.prev);
      }
      toast.error(msg || "Enrollment failed.");
    },
    onSuccess: () => {
      toast.success("Enrolled successfully!");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my });
    },
  });
};

export const useUnenroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => enrollmentsApi.unenroll(courseId),

    onMutate: async (courseId) => {
      await qc.cancelQueries({ queryKey: ENROLLMENT_KEYS.my });
      const prev = qc.getQueryData(ENROLLMENT_KEYS.my);
      qc.setQueryData(ENROLLMENT_KEYS.my, (old) =>
        Array.isArray(old)
          ? old.filter(
              (e) =>
                String(e.courseId ?? e.id) !== String(courseId),
            )
          : old,
      );
      return { prev };
    },

    onError: (err, _courseId, ctx) => {
      if (ctx?.prev) qc.setQueryData(ENROLLMENT_KEYS.my, ctx.prev);
      toast.error(err.message || "Unenroll failed.");
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ENROLLMENT_KEYS.my }),
  });
};

export const useUpdateProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, progress, nextItem, sectionsCompleted }) =>
      enrollmentsApi.updateProgress(courseId, {
        progress,
        nextItem,
        sectionsCompleted,
      }),

    onMutate: async ({ courseId, progress, nextItem, sectionsCompleted }) => {
      await qc.cancelQueries({ queryKey: ENROLLMENT_KEYS.my });
      const prev = qc.getQueryData(ENROLLMENT_KEYS.my);

      qc.setQueryData(ENROLLMENT_KEYS.my, (old) =>
        Array.isArray(old)
          ? old.map((e) =>
              e.courseId === courseId || e.id === courseId
                ? { ...e, progress, nextItem, sectionsCompleted }
                : e,
            )
          : old,
      );
      return { prev };
    },

    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ENROLLMENT_KEYS.my, ctx.prev);
      toast.error(err.message || "Failed to save progress.");
    },
  });
};

export const useAllEnrollments = (params) =>
  useQuery({
    queryKey: ENROLLMENT_KEYS.list(params),
    queryFn: () =>
      enrollmentsApi.getAll(params).then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  });

export { useMyEnrollments as useMyEnrollments2 };
