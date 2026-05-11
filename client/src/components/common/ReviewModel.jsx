import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Textarea } from "../ui/Input";

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

  // Stable handler to prevent defocus
  const handleChange = (e) => onFeedbackChange(e.target.value);
  

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isApprove ? "Approve Material" : "Reject Material"}
      subtitle={
        isApprove
          ? "This material will be visible to all students in the course."
          : "The student will be notified with your feedback."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isApprove ? "success" : "danger"}
            onClick={onConfirm}
            loading={loading}
          >
            {isApprove ? "✓ Confirm Approval" : "✕ Confirm Rejection"}
          </Button>
        </>
      }
    >
      <Textarea
        label="Feedback"
        hint="Optional — shown to the student"
        rows={4}
        placeholder={
          isApprove
            ? "Great work! Well explained…"
            : "Please revise and re-upload…"
        }
        value={feedback}
        onChange={handleChange}
      />
    </Modal>
  );
}
