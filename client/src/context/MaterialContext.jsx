import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const MaterialContext = createContext(null);
const STORAGE_KEY = "eduhub-materials-v1";

function loadMaterials() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load materials:", err);
  }
  return [];
}

export function MaterialProvider({ children }) {
  const [materials, setMaterials] = useState(loadMaterials);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    } catch (err) {
      console.warn("Failed to save materials:", err);
    }
  }, [materials]);

  const addMaterial = (material) => {
    const newMaterial = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      courseId: material.courseId,
      courseName: material.courseName,
      fileName: material.fileName,
      type: material.type,
      uploadDate: new Date().toISOString(),
    };
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const removeMaterial = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const value = useMemo(
    () => ({ materials, addMaterial, removeMaterial }),
    [materials]
  );

  return (
    <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>
  );
}

export function useMaterials() {
  const ctx = useContext(MaterialContext);
  if (!ctx) {
    throw new Error("useMaterials must be used within MaterialProvider");
  }
  return ctx;
}
