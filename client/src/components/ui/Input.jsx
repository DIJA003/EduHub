import { forwardRef, useId } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    required,
    className,
    containerClassName,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? `field-${autoId}`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={fieldId}
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

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={fieldId}
          disabled={disabled}
          className={cn(
            "w-full rounded-[var(--radius-md)] px-3.5 py-2.5",
            "bg-[var(--color-surface-2)] text-[var(--color-text)]",
            "text-[var(--text-base)] placeholder:text-[var(--color-text-3)]",
            "border transition-all duration-[var(--duration-normal)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            hasError
              ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:ring-opacity-30"
              : [
                  "border-[var(--color-border-2)]",
                  "hover:border-[var(--color-accent)] hover:border-opacity-50",
                  "focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-glow)]",
                ],
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]">
            {rightIcon}
          </div>
        )}
      </div>

      {hasError && (
        <p
          className="text-[var(--text-xs)] text-[var(--color-danger)] flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 4.5zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    required,
    className,
    containerClassName,
    rows = 4,
    id,
    disabled,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? `textarea-${autoId}`;
  const hasError = Boolean(error);
  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={fieldId}
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
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full rounded-[var(--radius-md)] px-3.5 py-2.5 resize-none",
          "bg-[var(--color-surface-2)] text-[var(--color-text)]",
          "text-[var(--text-base)] placeholder:text-[var(--color-text-3)]",
          "border transition-all duration-[var(--duration-normal)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          hasError
            ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)] focus:ring-opacity-30"
            : "border-[var(--color-border-2)] focus:border-[var(--color-accent)] focus:ring-[var(--color-accent-glow)]",
            props.disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      />
      {hasError && (
        <p
          className="text-[var(--text-xs)] text-[var(--color-danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !hasError && (
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {hint}
        </p>
      )}
    </div>
  );
});
