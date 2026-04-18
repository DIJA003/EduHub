import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { studentMaterialsApi, mentorReviewApi } from "../services/api";
import { useAuth } from "./AuthContext";

const MaterialContext = createContext(null);

export function MaterialProvider({ children }) {
  const { user, dbUser } = useAuth();
  const [materials,        setMaterials]        = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState(null);

  const shapeFromApi = (m) => ({
    id:           m._id,
    courseId:     m.courseId || m.courseRef || m.course || "",
    courseName:   m.course   || "",
    fileName:     m.title,
    type:         (m.type || "file").toLowerCase(),
    uploadDate:   m.createdAt || m.uploaded || new Date().toISOString(),
    status:       m.status || "pending",
    size:         m.size,
    uploader:     m.uploader,
    sectionId:    m.sectionId  || "",
    sectionLabel: m.sectionLabel || "",
    mentorFeedback: m.mentorFeedback || "",
  });

  // ── Load materials on login ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setMaterials([]);
      setPendingMaterials([]);
      return;
    }

    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        if (dbUser?.role === "mentor" || dbUser?.role === "admin") {
          // Mentor: get pending student materials for review
          const res = await mentorReviewApi.getPending();
          const shaped = (res.data || []).map(shapeFromApi);
          setPendingMaterials(shaped);
          setMaterials(shaped);
        } else {
          // Student: get own uploaded materials
          const res = await studentMaterialsApi.getAll();
          const shaped = (res.data || []).map(shapeFromApi);
          setMaterials(shaped);
          setPendingMaterials(shaped.filter((m) => m.status === "pending"));
        }
      } catch (err) {
        console.warn("MaterialContext: backend unavailable, using local state:", err.message);
        setError(err.message);
        setMaterials([]);
        setPendingMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [user, dbUser?.role]);

  // ── addMaterial (student uploads) ─────────────────────────────────────────
  const addMaterial = useCallback(async (material) => {
    // Optimistic local update
    const optimistic = {
      id:           `tmp-${Date.now()}`,
      courseId:     material.courseId     || "",
      courseName:   material.courseName   || "",
      fileName:     material.fileName,
      type:         material.type         || "file",
      uploadDate:   new Date().toISOString(),
      status:       "pending",
      sectionId:    material.sectionId    || "",
      sectionLabel: material.sectionLabel || "",
    };
    setMaterials((prev) => [optimistic, ...prev]);
    setPendingMaterials((prev) => [optimistic, ...prev]);

    try {
      const payload = {
        title:        material.fileName,
        course:       material.courseName || "",
        type:         material.type === "pdf"   ? "PDF"
                    : material.type === "video" ? "Video"
                    : "Other",
        courseId:     material.courseId     || "",
        yearId:       material.yearId       || "",
        sectionId:    material.sectionId    || "",
        sectionLabel: material.sectionLabel || "",
      };
      const res = await studentMaterialsApi.create(payload);
      const saved = shapeFromApi(res.data);
      setMaterials((prev) => prev.map((m) => m.id === optimistic.id ? saved : m));
      setPendingMaterials((prev) => prev.map((m) => m.id === optimistic.id ? saved : m));
    } catch (err) {
      // Backend unavailable — keep optimistic entry
      console.warn("Material upload to backend failed, keeping local:", err.message);
    }
  }, []);

  // ── removeMaterial ────────────────────────────────────────────────────────
  const removeMaterial = useCallback(async (id) => {
    const backup = materials.find((m) => m.id === id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setPendingMaterials((prev) => prev.filter((m) => m.id !== id));

    if (!id.startsWith("tmp-")) {
      try {
        await studentMaterialsApi.remove(id);
      } catch (err) {
        if (backup) setMaterials((prev) => [backup, ...prev]);
        console.warn("Failed to remove material from backend:", err.message);
      }
    }
  }, [materials]);

  // ── approveMaterial (mentor) ───────────────────────────────────────────────
  const approveMaterial = useCallback(async (id, feedback = "") => {
    setPendingMaterials((prev) => prev.filter((m) => m.id !== id));
    setMaterials((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: "approved" } : m)
    );
    try {
      await mentorReviewApi.approve(id, feedback);
    } catch (err) {
      console.warn("Backend approve failed:", err.message);
    }
  }, []);

  // ── rejectMaterial (mentor) ───────────────────────────────────────────────
  const rejectMaterial = useCallback(async (id, feedback = "") => {
    setPendingMaterials((prev) => prev.filter((m) => m.id !== id));
    setMaterials((prev) =>
      prev.map((m) => m.id === id ? { ...m, status: "rejected" } : m)
    );
    try {
      await mentorReviewApi.reject(id, feedback);
    } catch (err) {
      console.warn("Backend reject failed:", err.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      materials,
      pendingMaterials,
      loading,
      error,
      addMaterial,
      removeMaterial,
      approveMaterial,
      rejectMaterial,
    }),
    [materials, pendingMaterials, loading, error, addMaterial, removeMaterial, approveMaterial, rejectMaterial],
  );

  return (
    <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>
  );
}

export function useMaterials() {
  const ctx = useContext(MaterialContext);
  if (!ctx) throw new Error("useMaterials must be used within MaterialProvider");
  return ctx;
}