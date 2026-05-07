import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant,
  confirmVariant,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const btnVariant = variant || confirmVariant || "danger";

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
          <Button variant={btnVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && (
        <p className="text-[var(--text-sm)] leading-relaxed text-[var(--color-text-2)]">
          {message}
        </p>
      )}
    </Modal>
  );
}
