import { useToasts } from "../../hooks/useToasts";
import { cn } from "../../lib/utils";

const typeConfig = {
  success: {
    bar: "bg-[var(--color-success)]",
    icon: "✓",
    bg: "glass-strong border border-[var(--color-success)] border-opacity-30",
    text: "text-[var(--color-success)]",
  },
  error: {
    bar: "bg-[var(--color-danger)]",
    icon: "✕",
    bg: "glass-strong border border-[var(--color-danger)] border-opacity-30",
    text: "text-[var(--color-danger)]",
  },
  warning: {
    bar: "bg-[var(--color-warning)]",
    icon: "⚠",
    bg: "glass-strong border border-[var(--color-warning)] border-opacity-30",
    text: "text-[var(--color-warning)]",
  },
  info: {
    bar: "bg-[var(--color-info)]",
    icon: "ℹ",
    bg: "glass-strong border border-[var(--color-info)] border-opacity-30",
    text: "text-[var(--color-info)]",
  },
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="fixed bottom-5 right-5 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => {
        const cfg = typeConfig[t.type] || typeConfig.info;
        return (
          <div
            key={t.id}
            className={cn(
              "relative flex items-start gap-3 rounded-[var(--radius-lg)] px-4 py-3 overflow-hidden",
              "animate-slide-right shadow-[var(--shadow-lg)]",
              cfg.bg,
            )}
          >
            {/* Accent bar */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-0.5 rounded-r",
                cfg.bar,
              )}
            />

            {/* Icon */}
            <span
              className={cn("shrink-0 mt-0.5 text-base font-bold", cfg.text)}
            >
              {cfg.icon}
            </span>

            <p className="text-[var(--text-sm)] font-medium flex-1 text-[var(--color-text)]">
              {t.message}
            </p>

            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
