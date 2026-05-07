import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variants = {
  solid:
    "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-md)]",
  glass:
    "glass border-[var(--color-border)] shadow-[var(--shadow-lg)] bg-[rgba(27,31,43,0.55)]",
  subtle:
    "bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]",
};

export const Card = forwardRef(function Card(
  {
    as: Tag = "div",
    variant = "solid",
    padding = true,
    interactive = false,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "rounded-[var(--radius-xl)] backdrop-blur-md",
        variants[variant] ?? variants.solid,
        padding && "p-5 sm:p-6",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-[var(--duration-normal)] hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
});

export function CardHeader({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="text-[var(--text-base)] font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-0.5 text-[var(--text-sm)] text-[var(--color-text-3)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
