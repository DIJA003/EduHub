import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import Button from "../ui/Button";
import { sectionMotionProps, usePrefersReducedMotion } from "../../lib/motion";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  compact = false,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      {...sectionMotionProps(reduced)}
      role="status"
      className={cn(
        "flex flex-col items-center justify-center px-4 text-center",
        compact ? "py-12" : "py-16 pb-10",
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface-2)]/80 text-[var(--color-text-3)] shadow-inner backdrop-blur-sm",
            compact ? "h-12 w-12 text-2xl" : "h-16 w-16 text-3xl",
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-[var(--color-text)]",
          compact ? "text-[var(--text-sm)]" : "text-[var(--text-base)]",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mx-auto mt-1.5 max-w-sm leading-relaxed text-[var(--color-text-3)]",
            compact ? "text-[var(--text-xs)]" : "text-[var(--text-sm)]",
          )}
        >
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
    </motion.div>
  );
}

export { EmptyState };
