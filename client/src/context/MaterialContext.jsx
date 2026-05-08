
import { createContext, useContext, useState } from "react";

const MaterialContext = createContext(null);

export function MaterialProvider({ children }) {
  const [materials, setMaterials] = useState([]);

  const addMaterial = (material) =>
    setMaterials((prev) => [material, ...prev]);

  const removeMaterial = (id) =>
    setMaterials((prev) => prev.filter((m) => m.id !== id));

  const updateMaterialStatus = (id, status) =>
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );

  return (
    <MaterialContext.Provider value={{ materials, addMaterial, removeMaterial, updateMaterialStatus }}>
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterials() {
  return useContext(MaterialContext);
}