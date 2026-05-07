import { useEffect, useRef, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import {
  modalBackdropProps,
  modalPanelProps,
  usePrefersReducedMotion,
} from "../../lib/motion";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full mx-4",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  hideClose = false,
  className,
}) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKey);
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (closeOnOverlay && e.target === overlayRef.current) onClose?.();
    },
    [closeOnOverlay, onClose],
  );

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="edu-modal-overlay"
          ref={overlayRef}
          onClick={handleOverlayClick}
          className={cn(
            "fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4",
          )}
          style={{
            background: "rgba(0,0,0,0.55)",
          }}
          role="presentation"
          {...modalBackdropProps(reduced)}
        >
          <motion.div
            key="edu-modal-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className={cn(
              "w-full outline-none",
              "rounded-[var(--radius-2xl)] border border-[var(--color-border-2)]",
              "glass shadow-[var(--shadow-xl)]",
              sizes[size] ?? sizes.md,
              className,
            )}
            {...modalPanelProps(reduced)}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || !hideClose) && (
              <div className="flex items-start justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className="text-[var(--text-lg)] font-semibold tracking-tight text-[var(--color-text)]"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-[var(--text-sm)] text-[var(--color-text-3)]">
                      {subtitle}
                    </p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className={cn(
                      "ml-4 shrink-0 rounded-[var(--radius-md)] p-1.5",
                      "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
                      "hover:bg-[var(--color-surface-3)]",
                      "transition-colors duration-[var(--duration-fast)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                    )}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            <div className="max-h-[min(70vh,560px)] overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
              {children}
            </div>

            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2.5 rounded-b-[var(--radius-2xl)] border-t border-[var(--color-border)] bg-[var(--color-ink-soft)]/90 px-5 py-3.5 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
