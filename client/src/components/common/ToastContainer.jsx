import { useToasts } from "../../hooks/useToasts";
import { cn } from "../../lib/utils";

const typeStyles = {
  success:
    "bg-[var(--color-success)]/92 text-white shadow-[var(--shadow-lg)] backdrop-blur-sm",
  error:
    "bg-[var(--color-danger)]/92 text-white shadow-[var(--shadow-lg)] backdrop-blur-sm",
  info: "bg-[var(--color-accent)] text-white shadow-[var(--shadow-lg)] backdrop-blur-sm",
  warning:
    "border border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-text)] shadow-[var(--shadow-md)]",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[var(--z-toast)] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-[var(--radius-lg)] px-4 py-3",
            typeStyles[t.type] || typeStyles.info,
            "animate-in slide-in-from-right-5 duration-300",
          )}
        >
          <p className="flex-1 text-[var(--text-sm)] font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-lg leading-none opacity-75 transition-opacity hover:opacity-100"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
