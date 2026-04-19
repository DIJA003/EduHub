import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialsApi, uploadsApi } from "../../../lib/api/materials.api";
import { toast } from "../../../hooks/useToast";

export const MATERIAL_KEYS = {
  all: ["materials"],
  my: ["materials", "my"],
  pending: ["materials", "pending"],
  list: (params) => ["materials", "list", params],
};

export const useMyMaterials = (params) =>
  useQuery({
    queryKey: [...MATERIAL_KEYS.my, params],
    queryFn: () => materialsApi.getMy(params).then((r) => r.data),
  });

export const usePendingMaterials = (params) =>
  useQuery({
    queryKey: [...MATERIAL_KEYS.pending, params],
    queryFn: () => materialsApi.getPending(params).then((r) => r.data),
  });

export const useAllMaterials = (params) =>
  useQuery({
    queryKey: MATERIAL_KEYS.list(params),
    queryFn: () => materialsApi.getAll(params).then((r) => r.data),
  });

export const useApproveMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }) => materialsApi.approve(id, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      toast.success("Material approved");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useRejectMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }) => materialsApi.reject(id, feedback),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      toast.success("Material rejected");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: materialsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      toast.success("Material deleted");
    },
    onError: (err) => toast.error(err.message),
  });
};

export const useFirebaseUpload = () => {
  const qc = useQueryClient();

  const upload = async (
    { file, courseId, sectionId, sectionLabel, yearId, title },
    onProgress,
  ) => {
    if (!file) throw new Error("No file provided");

    const { data: urlData } = await uploadsApi.getSignedUrl({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      courseId,
      sectionId,
      sectionLabel,
      yearId,
    });

    const { signedUrl, storagePath, fileType } = urlData;

    await uploadWithProgress(
      signedUrl,
      file,
      file.type || "application/octet-stream",
      onProgress,
    );

    const { data: material } = await uploadsApi.confirm({
      storagePath,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      courseId,
      sectionId,
      sectionLabel,
      yearId,
      title: title || file.name.replace(/\.[^.]+$/, ""),
      fileType,
    });

    qc.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
    return material;
  };

  return { upload };
};

const uploadWithProgress = (signedUrl, file, contentType, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 90));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload")),
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));
    xhr.addEventListener("timeout", () =>
      reject(new Error("Upload timed out")),
    );

    xhr.timeout = 10 * 60 * 1000; // 10 min
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(file);
  });
