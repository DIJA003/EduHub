import Button from "../ui/Button";
import { cn } from "../../lib/utils";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 w-16 h-16 rounded-[var(--radius-2xl)] bg-[var(--gradient-subtle)] flex items-center justify-center text-[var(--color-accent)]" aria-hidden="true">
          {typeof icon === "string" ? (
            <span className="text-3xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-[var(--text-sm)] text-[var(--color-text-3)] max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && typeof action === "function" && actionLabel && (
        <Button className="mt-5" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
      {action && typeof action !== "function" && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}

export { EmptyState };
