import { cn } from "../../lib/utils";
import { motion, usePrefersReducedMotion, sectionMotionProps } from "../../lib/motion";

export default function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.header
      className={cn("mb-6 sm:mb-8", className)}
      {...sectionMotionProps(reduced, 0)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <p className="text-[var(--text-xs)] font-semibold uppercase tracking-widest text-[var(--color-accent-2)]">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-[var(--text-sm)] text-[var(--color-text-2)]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </motion.header>
  );
}
