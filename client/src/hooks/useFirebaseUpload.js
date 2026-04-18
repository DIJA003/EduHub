import { useState, useCallback } from "react";
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
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          courseId: courseId || undefined,
          sectionId: sectionId || undefined,
          sectionLabel: sectionLabel || undefined,
          yearId: yearId || undefined,
        });

        const { signedUrl, storagePath, fileType } = signedRes.data;

        if (!signedUrl || !storagePath) {
          throw new Error(
            "Failed to get upload URL from server. Please try again.",
          );
        }

        await uploadWithProgress(signedUrl, file, (pct) => setProgress(pct));

        setProgress(95);

        const confirmRes = await uploadApi.confirmUpload({
          storagePath,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          courseId: courseId || undefined,
          sectionId: sectionId || undefined,
          sectionLabel: sectionLabel || undefined,
          yearId: yearId || undefined,
          title: title || file.name.replace(/\.[^.]+$/, ""),
        });

        if (!confirmRes.data) {
          throw new Error("Upload confirmed but no material record returned.");
        }

        setProgress(100);
        return confirmRes.data;
      } catch (err) {
        const message = err.message || "Upload failed";
        setError(message);
        throw new Error(message);
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
        reject(
          new Error(
            `Firebase upload failed: ${xhr.status} ${xhr.statusText}. Please check your internet connection.`,
          ),
        );
      }
    });

    xhr.addEventListener("error", () => {
      reject(
        new Error(
          "Network error during file upload. Please check your connection.",
        ),
      );
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted."));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload timed out. Please try again."));
    });

    xhr.timeout = 10 * 60 * 1000;
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.send(file);
  });
}
