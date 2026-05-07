import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsApi } from "../../../lib/api/materials.api";
import { toast } from "../../../hooks/useToasts";

export const MATERIAL_KEYS = {
  all: ["materials"],
  my: ["materials", "my"],
  pending: ["materials", "pending"],
  list: (params) => ["materials", "list", params],
};
export const useMyMaterials = (params) =>
  useQuery({
    queryKey: [...MATERIAL_KEYS.my, params],
    queryFn: () =>
      materialsApi.getMy(params).then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  });

export const usePendingMaterials = (params) =>
  useQuery({
    queryKey: [...MATERIAL_KEYS.pending, params],
    queryFn: () =>
      materialsApi.getPending(params).then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 15_000,
  });

export const useAllMaterials = (params) =>
  useQuery({
    queryKey: MATERIAL_KEYS.list(params),
    queryFn: () => materialsApi.getAll(params).then((r) => r.data),
    staleTime: 20_000,
  });

export const useCreateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      materialsApi.create(data).then((r) => r.data?.data ?? r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
    },
    onError: (err) =>
      toast.error(err.message || "Failed to save material record."),
  });
};

export const useApproveMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback = "" }) => materialsApi.approve(id, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      toast.success("Material approved.");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useRejectMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback = "" }) => materialsApi.reject(id, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      toast.success("Material rejected.");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => materialsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: MATERIAL_KEYS.all });
      const prev = {
        my: qc.getQueryData(MATERIAL_KEYS.my),
        pending: qc.getQueryData(MATERIAL_KEYS.pending),
      };

      qc.setQueryData(MATERIAL_KEYS.my, (old) =>
        Array.isArray(old)
          ? old.filter((m) => m._id !== id && m.id !== id)
          : old,
      );
      qc.setQueryData(MATERIAL_KEYS.pending, (old) =>
        Array.isArray(old)
          ? old.filter((m) => m._id !== id && m.id !== id)
          : old,
      );
      return prev;
    },
    onError: (err, _id, ctx) => {
      if (ctx?.my) qc.setQueryData(MATERIAL_KEYS.my, ctx.my);
      if (ctx?.pending) qc.setQueryData(MATERIAL_KEYS.pending, ctx.pending);
      toast.error(err.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all }),
  });
};

export const useFirebaseUpload = () => {
  const qc = useQueryClient();

  const upload = async (
    { file, courseId, sectionId, sectionLabel, yearId, title },
    onProgress = () => {},
  ) => {
    if (!file) throw new Error("No file provided.");

    const formData = new FormData();
    formData.append("file", file);
    if (courseId) formData.append("courseId", courseId);
    if (sectionId) formData.append("sectionId", sectionId);
    if (sectionLabel) formData.append("sectionLabel", sectionLabel);
    if (yearId) formData.append("yearId", yearId);
    if (title) formData.append("title", title);
    else formData.append("title", file.name.replace(/\.[^.]+$/, ""));

    const { auth } = await import("../../../lib/firebase");
    const token = await auth.currentUser?.getIdToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
            resolve(data?.data ?? data);
          } catch {
            reject(new Error("Invalid server response."));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `Upload failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () =>
        reject(new Error("Network error during upload.")),
      );
      xhr.addEventListener("abort", () =>
        reject(new Error("Upload cancelled.")),
      );
      xhr.addEventListener("timeout", () =>
        reject(new Error("Upload timed out.")),
      );

      xhr.timeout = 10 * 60 * 1000;

      const BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:8000/api";

      xhr.open("POST", `${BASE_URL}/uploads/upload`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  };

  return { upload };
};
