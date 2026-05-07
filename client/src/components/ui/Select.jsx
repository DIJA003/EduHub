import { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    required,
    className,
    containerClassName,
    children,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const id = props.id ?? `select-${autoId}`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="text-[var(--text-sm)] font-medium text-[var(--color-text-2)] flex items-center gap-1"
        >
          {label}
          {required && (
            <span
              className="text-[var(--color-danger)] text-xs"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          "w-full appearance-none rounded-[var(--radius-md)] px-3.5 py-2.5 pr-10",
          "bg-[var(--color-surface-2)] text-[var(--color-text)]",
          "text-[var(--text-base)]",
          "border transition-all duration-[var(--duration-normal)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          "bg-[length:14px_10px] bg-[right_14px_center] bg-no-repeat",
          hasError
            ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:ring-opacity-30"
            : [
                "border-[var(--color-border-2)]",
                "hover:border-[var(--color-accent)] hover:border-opacity-50",
                "focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-glow)]",
              ],
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23636b8a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
        }}
        {...props}
      >
        {children}
      </select>
      {hasError && (
        <p className="text-[var(--text-xs)] text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">{hint}</p>
      )}
    </div>
  );
});

export default Select;
