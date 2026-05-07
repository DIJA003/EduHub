import { useState, useEffect, useCallback } from "react";

const listeners = new Set();
let _id = 0;

const emit = (type, message, duration = 4000) => {
  const id = ++_id;
  listeners.forEach((fn) => fn({ id, type, message, duration }));
  return id;
};

export const toast = {
  success: (message, duration) => emit("success", message, duration),
  error: (message, duration) => emit("error", message, duration),
  info: (message, duration) => emit("info", message, duration),
  warning: (message, duration) => emit("warning", message, duration),
};

export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
};

export const useToast = () => {
  const addToast = useCallback((message, type = "info", duration = 4000) => {
    emit(type, message, duration);
  }, []);
  return { addToast };
};
