import { useToasts } from "../../hooks/useToast";
import { cn } from "../../lib/utils";

const typeStyles = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-blue-600 text-white",
  warning: "bg-amber-500 text-white",
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToasts();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg",
            "animate-in slide-in-from-right-5 duration-300",
            typeStyles[t.type] || typeStyles.info,
          )}
        >
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 opacity-70 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
