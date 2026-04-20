import { useState, useEffect } from "react";
const listeners = new Set();

let toastId = 0;

const emit = (type, message) => {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, type, message }));
  return id;
};

export const toast = {
  success: (message) => emit("success", message),
  error: (message) => emit("error", message),
  info: (message) => emit("info", message),
  warning: (message) => emit("warning", message),
};

export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };

    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, dismiss };
};
