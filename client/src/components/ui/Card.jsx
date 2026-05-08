import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const variants = {
  default: "bg-[var(--gradient-card)] border-[var(--color-border)] shadow-[var(--shadow-card)]",
  elevated: "bg-[var(--color-surface)] border-[var(--color-border-2)] shadow-[var(--shadow-elevated)]",
  glass: "glass border-[var(--color-border)]",
  "glass-strong": "glass-strong border-[var(--color-border-2)]",
  outline: "bg-transparent border-[var(--color-border-2)]",
  accent: "bg-[var(--color-accent-soft)] border-[var(--color-accent)] border-opacity-25",
  success: "bg-[var(--color-success-soft)] border-[var(--color-success)] border-opacity-25",
  warning: "bg-[var(--color-warning-soft)] border-[var(--color-warning)] border-opacity-25",
  danger: "bg-[var(--color-danger-soft)] border-[var(--color-danger)] border-opacity-25",
};

const Card = forwardRef(function Card(
  {
    variant = "default",
    padding = "md",
    hover = false,
    interactive = false,
    className,
    children,
    ...props
  },
  ref
) {
  const paddingMap = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "border rounded-[var(--radius-xl)]",
        "transition-all duration-[var(--duration-normal)]",
        variants[variant] ?? variants.default,
        paddingMap[padding] ?? paddingMap.md,
        hover && "hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-2)]",
        interactive && "cursor-pointer active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 pb-4 mb-4",
        "border-b border-[var(--color-border)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn(
        "text-[var(--text-base)] font-bold text-[var(--color-text)]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }) {
  return (
    <p
      className={cn(
        "text-[var(--text-sm)] text-[var(--color-text-3)] mt-1",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 mt-4",
        "border-t border-[var(--color-border)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
