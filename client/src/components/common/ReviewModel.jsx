import Modal from "../ui/Modal";
import Button from "../ui/Button";

export default function ReviewModal({
  open,
  action,
  feedback,
  onFeedbackChange,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;

  const isApprove = action === "approve";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isApprove ? "✅ Approve Material" : "❌ Reject Material"}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "primary" : "danger"}
            onClick={onConfirm}
            loading={loading}
          >
            {isApprove ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 mb-3">
        Add feedback <span className="font-semibold">(optional)</span>:
      </p>
      <textarea
        rows={4}
        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm
                   text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={isApprove ? "Great work!…" : "Please revise…"}
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
      />
    </Modal>
  );
}
