import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import Button from "./Button";

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

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();

      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = panel.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (
          e.shiftKey
            ? document.activeElement === first
            : document.activeElement === last
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    setTimeout(() => panelRef.current?.focus(), 50);

    return () => {
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

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      role="presentation"
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
        className={cn(
          "w-full outline-none animate-scale-in",
          "bg-[var(--color-surface)] border border-[var(--color-border-2)]",
          "rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)]",
          sizes[size] ?? sizes.md,
          className,
        )}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--color-border)]">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-[var(--text-lg)] font-semibold text-[var(--color-text)]"
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className={cn(
                  "rounded-[var(--radius-md)] p-1.5 ml-4 shrink-0",
                  "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
                  "hover:bg-[var(--color-surface-3)]",
                  "transition-colors duration-[var(--duration-fast)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

        {/* Body */}
        <div className="px-6 py-5 max-h-[calc(100vh-240px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-ink-soft)] rounded-b-[var(--radius-2xl)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && (
        <p className="text-[var(--text-sm)] text-[var(--color-text-2)] leading-relaxed">
          {message}
        </p>
      )}
    </Modal>
  );
}
