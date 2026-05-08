import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Dropdown({
  trigger,
  children,
  align = "end",
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div onClick={() => setOpen((o) => !o)}>
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-[var(--z-dropdown)] mt-2 min-w-[180px]",
              "glass-strong border border-[var(--color-border-2)]",
              "rounded-[var(--radius-xl)] shadow-[var(--shadow-elevated)]",
              "overflow-hidden py-1",
              align === "end" ? "right-0" : "left-0",
            )}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  icon: Icon,
  children,
  onClick,
  danger = false,
  disabled = false,
  active = false,
  className,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 text-left",
        "text-[var(--text-sm)] font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        danger
          ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
          : "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
        active && "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />}
      <span className="flex-1 truncate">{children}</span>
      {active && <Check className="w-4 h-4 shrink-0 text-[var(--color-accent)]" strokeWidth={2} />}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-[var(--color-border)]" />;
}

export function DropdownLabel({ children, className }) {
  return (
    <p
      className={cn(
        "px-3 py-2 text-[var(--text-xs)] font-semibold uppercase tracking-wider",
        "text-[var(--color-text-3)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = useCallback((optionValue) => {
    onChange?.(optionValue);
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-2.5",
          "bg-[var(--color-surface)] border border-[var(--color-border)]",
          "rounded-[var(--radius-lg)] text-[var(--text-sm)]",
          "transition-all duration-[var(--duration-fast)]",
          "hover:border-[var(--color-border-2)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
          open && "border-[var(--color-accent)] ring-2 ring-[var(--color-accent-glow)]",
        )}
      >
        <span className={cn(!selectedOption && "text-[var(--color-text-3)]")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-[var(--color-text-3)] transition-transform duration-[var(--duration-fast)]",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-[var(--z-dropdown)] mt-2 w-full",
              "glass-strong border border-[var(--color-border-2)]",
              "rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)]",
              "overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar",
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5",
                  "text-[var(--text-sm)] text-left",
                  "transition-colors duration-[var(--duration-fast)]",
                  option.value === value
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]",
                )}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
