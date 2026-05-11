import React from "react";
import { useToasts } from "../../hooks/useToasts";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";

function formatToastMessage(message) {
  if (message == null || message === false) return "";
  if (typeof message === "string" || typeof message === "number") {
    return String(message);
  }
  if (message instanceof Error) {
    return message.message || "Something went wrong";
  }
  try {
    return JSON.stringify(message);
  } catch {
    return "Something went wrong";
  }
}

const typeConfig = {
  success: {
    bar: "bg-[var(--color-success)]",
    icon: "✓",
    iconBg: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    text: "text-[var(--color-text)]",
  },
  error: {
    bar: "bg-[var(--color-danger)]",
    icon: "✕",
    iconBg: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    text: "text-[var(--color-text)]",
  },
  info: {
    bar: "bg-[var(--color-accent)]",
    icon: "ℹ",
    iconBg: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    text: "text-[var(--color-text)]",
  },
  warning: {
    bar: "bg-[var(--color-warning)]",
    icon: "⚠",
    iconBg: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    text: "text-[var(--color-text)]",
  },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
        const config = typeConfig[t.type] ?? typeConfig.info;
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] px-4 py-3",
              "bg-[var(--color-surface-2)] border border-[var(--color-border-2)]",
              "shadow-[var(--shadow-xl)]",
              "relative overflow-hidden",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-bold shrink-0 mt-0.5",
                config.iconBg,
              )}
            >
              {config.icon}
            </div>
            <p
              className={cn(
                "text-[var(--text-sm)] font-medium flex-1 leading-relaxed",
                config.text,
              )}
            >
              {formatToastMessage(t.message)}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors text-lg leading-none"
            >
              ×
            </button>
            <div
              className={cn(
                "absolute bottom-0 left-0 h-0.5 w-full",
                config.bar,
              )}
            />
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
}
