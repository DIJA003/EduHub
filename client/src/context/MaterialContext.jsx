import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { materialsApi } from "../services/api";
import { useAuth } from "./AuthContext";

const MaterialContext = createContext(null);

export function MaterialProvider({ children }) {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shapeFromApi = (m) => ({
    id: m._id,
    courseId: m.courseRef || m.course || "",
    courseName: m.course || "",
    fileName: m.title,
    type: (m.type || "file").toLowerCase(),
    uploadDate: m.createdAt || m.uploaded || new Date().toISOString(),
    status: m.status,
    size: m.size,
    uploader: m.uploader,
    sectionId: m.sectionId || m.sectionRef || "",
    sectionLabel: m.sectionLabel || m.section || "",
  });

  useEffect(() => {
    if (!user) {
      setMaterials([]);
      return;
    }

    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await materialsApi.getAll();
        setMaterials((res.data || []).map(shapeFromApi));
      } catch (err) {
        console.error("Failed to load materials:", err.message);
        setError(err.message);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [user]);

  const addMaterial = useCallback(async (material) => {
    const optimistic = {
      id: `tmp-${Date.now()}`,
      courseId: material.courseId || "",
      courseName: material.courseName || "",
      fileName: material.fileName,
      type: material.type || "file",
      uploadDate: new Date().toISOString(),
      status: "Draft",
      sectionId: material.sectionId || "",
      sectionLabel: material.sectionLabel || "",
    };
    setMaterials((prev) => [optimistic, ...prev]);

    try {
      const payload = {
        title: material.fileName,
        course: material.courseName,
        type:
          material.type === "pdf"
            ? "PDF"
            : material.type === "video"
              ? "Video"
              : "Other",
        status: "Draft",
        uploader: material.uploader || "",
        ...(material.sectionId && { sectionId: material.sectionId }),
        ...(material.sectionLabel && { sectionLabel: material.sectionLabel }),
      };
      const res = await materialsApi.create(payload);
      setMaterials((prev) =>
        prev.map((m) => (m.id === optimistic.id ? shapeFromApi(res.data) : m)),
      );
    } catch (err) {
      setMaterials((prev) => prev.filter((m) => m.id !== optimistic.id));
      console.error("Failed to save material:", err.message);
    }
  }, []);

  const removeMaterial = useCallback(
    async (id) => {
      const backup = materials.find((m) => m.id === id);
      setMaterials((prev) => prev.filter((m) => m.id !== id));

      try {
        await materialsApi.remove(id);
      } catch (err) {
        if (backup) setMaterials((prev) => [backup, ...prev]);
        console.error("Failed to remove material:", err.message);
      }
    },
    [materials],
  );

  const value = useMemo(
    () => ({ materials, loading, error, addMaterial, removeMaterial }),
    [materials, loading, error, addMaterial, removeMaterial],
  );

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterials() {
  const ctx = useContext(MaterialContext);
  if (!ctx)
    throw new Error("useMaterials must be used within MaterialProvider");
  return ctx;
}
