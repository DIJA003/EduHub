import { useState, useCallback } from "react";
import { auth } from "../services/firebase";
import { uploadApi } from "../services/api";

export function useFirebaseUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(
    async ({ file, courseId, sectionId, sectionLabel, yearId, title }) => {
      if (!file) throw new Error("No file provided");

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const signedRes = await uploadApi.getUploadUrl({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          courseId,
          sectionId,
          sectionLabel,
          yearId,
        });

        const { signedUrl, storagePath, fileType } = signedRes.data;

        await uploadWithProgress(signedUrl, file, (pct) => setProgress(pct));

        const confirmRes = await uploadApi.confirmUpload({
          storagePath,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          courseId,
          sectionId,
          sectionLabel,
          yearId,
          title: title || file.name.replace(/\.[^.]+$/, ""),
        });

        setProgress(100);
        return confirmRes.data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { upload, uploading, progress, error, reset };
}

function uploadWithProgress(signedUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 90);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
