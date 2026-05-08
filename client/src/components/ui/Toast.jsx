import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-red-500/30 bg-red-500/10",
  warning: "border-amber-500/30 bg-amber-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

const iconStyles = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-blue-400",
};

function Toast({ id, type = "info", title, message, onDismiss }) {
  const Icon = icons[type] ?? icons.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex items-start gap-3 w-[360px] max-w-[calc(100vw-32px)]",
        "p-4 rounded-[var(--radius-xl)]",
        "glass-strong border shadow-[var(--shadow-elevated)]",
        styles[type] ?? styles.info,
      )}
      role="alert"
    >
      <div className={cn("shrink-0 mt-0.5", iconStyles[type])}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] mb-0.5">
            {title}
          </p>
        )}
        {message && (
          <p className="text-[var(--text-sm)] text-[var(--color-text-2)] leading-relaxed">
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          "shrink-0 p-1 rounded-[var(--radius-sm)]",
          "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
          "hover:bg-[var(--color-surface-3)]",
          "transition-colors duration-[var(--duration-fast)]",
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </motion.div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = "info", title, message, duration = 5000 }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title, message) => toast({ type: "success", title, message }), [toast]);
  const error = useCallback((title, message) => toast({ type: "error", title, message }), [toast]);
  const warning = useCallback((title, message) => toast({ type: "warning", title, message }), [toast]);
  const info = useCallback((title, message) => toast({ type: "info", title, message }), [toast]);

  return (
    <ToastContext.Provider
      value={{ toast, dismiss, dismissAll, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default Toast;
