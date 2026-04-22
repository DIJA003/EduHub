import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsApi, uploadsApi } from "../../../lib/api/materials.api";
import { toast } from "../../../hooks/useToasts";

export const MATERIAL_KEYS = {
  all: ["materials"],
  my: ["materials", "my"],
  pending: ["materials", "pending"],
  list: (params) => ["materials", "list", params],
};
const detectFileType = (mimeType) => {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Slides";
  if (mimeType.includes("zip")) return "ZIP";
  return "Other";
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
    queryFn: () =>
      materialsApi.getAll(params).then((r) => r.data?.data ?? r.data ?? []),
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

    const { data: urlResp } = await uploadsApi.getSignedUrl({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      courseId: courseId || undefined,
      sectionId: sectionId || undefined,
      sectionLabel: sectionLabel || undefined,
      yearId: yearId || undefined,
    });

    const { signedUrl, storagePath, fileType } = urlResp?.data ?? urlResp;
    if (!signedUrl || !storagePath) {
      throw new Error(
        "Server did not return a valid upload URL. Please try again.",
      );
    }

    await xhrUpload(
      signedUrl,
      file,
      file.type || "application/octet-stream",
      (pct) => onProgress(Math.round(pct * 0.9)),
    );

    onProgress(95);
    const { data: confirmResp } = await uploadsApi.confirm({
      storagePath,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      courseId: courseId || undefined,
      sectionId: sectionId || undefined,
      sectionLabel: sectionLabel || undefined,
      yearId: yearId || undefined,
      title: title || file.name.replace(/\.[^.]+$/, ""),
      fileType,
    });

    onProgress(100);
    qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
    return confirmResp?.data ?? confirmResp;
  };

  return { upload };
};

function xhrUpload(signedUrl, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else
        reject(
          new Error(`Firebase upload failed: ${xhr.status} ${xhr.statusText}`),
        );
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload.")),
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));
    xhr.addEventListener("timeout", () =>
      reject(new Error("Upload timed out.")),
    );

    xhr.timeout = 10 * 60 * 1000;
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
}
