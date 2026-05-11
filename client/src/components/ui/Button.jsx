import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variants = {
  primary: [
    "relative overflow-hidden",
    "bg-[var(--color-accent)] text-white",
    "shadow-[var(--shadow-accent)]",
    "hover:brightness-110 hover:shadow-[0_0_32px_var(--color-accent-glow)]",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
    "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
  ].join(" "),

  secondary: [
    "glass text-[var(--color-text)]",
    "border border-[var(--color-border-2)]",
    "hover:border-[var(--color-accent)] hover:text-[var(--color-accent-2)]",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--color-text-2)]",
    "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  danger: [
    "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
    "border border-[var(--color-danger)] border-opacity-30",
    "hover:bg-[var(--color-danger)] hover:text-white hover:border-transparent",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  success: [
    "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    "border border-[var(--color-success)] border-opacity-30",
    "hover:bg-[var(--color-success)] hover:text-white hover:border-transparent",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  link: [
    "bg-transparent text-[var(--color-accent)] underline-offset-4",
    "hover:underline hover:text-[var(--color-accent-2)]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),

  gradient: [
    "relative overflow-hidden text-white font-semibold",
    "bg-gradient-to-r from-[var(--color-accent)] to-[#4fc3f7]",
    "shadow-[var(--shadow-accent)]",
    "hover:shadow-[0_0_40px_var(--color-accent-glow)] hover:brightness-110",
    "active:scale-[0.97]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ].join(" "),
};

const sizes = {
  xs: "px-2.5 py-1.5 text-[var(--text-xs)] gap-1.5 rounded-[var(--radius-sm)]",
  sm: "px-3.5 py-2   text-[var(--text-sm)]  gap-2   rounded-[var(--radius-md)]",
  md: "px-5   py-2.5 text-[var(--text-base)] gap-2   rounded-[var(--radius-md)]",
  lg: "px-6   py-3   text-[var(--text-lg)]   gap-2.5 rounded-[var(--radius-lg)]",
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    children,
    className,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-[var(--duration-normal)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--color-ink)]",
        "select-none whitespace-nowrap",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        isDisabled && "pointer-events-none",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
          {children}
          {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
});

export default Button;
