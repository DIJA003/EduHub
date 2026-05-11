import { useState } from "react";
import { X } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { requestsApi } from "../../lib/api/requests.api";
import { useToast } from "../../hooks/useToasts";

const REQUEST_TYPES = {
  FACULTY: "add_faculty",
  PROGRAM: "add_program",
  SUPPORT: "support",
  GENERAL: "general",
};

export default function RequestModal({ isOpen, onClose, type, facultyId = null, isPublic = false, guestInfo = null }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    code: "",
    name: "",
    description: "",
  });

  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case REQUEST_TYPES.FACULTY:
        return "Request New Faculty";
      case REQUEST_TYPES.PROGRAM:
        return "Request New Program";
      case REQUEST_TYPES.SUPPORT:
        return "Contact Support";
      default:
        return "Submit Request";
    }
  };

  const getDescription = () => {
    switch (type) {
      case REQUEST_TYPES.FACULTY:
        return "Can't find your faculty? Submit a request to add it.";
      case REQUEST_TYPES.PROGRAM:
        return "Can't find your program? Submit a request to add it.";
      case REQUEST_TYPES.SUPPORT:
        return "Need help? Our support team will assist you.";
      default:
        return "Submit your request to the admin team.";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        type,
        title: form.title || form.name || "New Request",
        message: form.message || form.description || "",
      };

      // For faculty/program requests, include structured data
      if (type === REQUEST_TYPES.FACULTY || type === REQUEST_TYPES.PROGRAM) {
        requestData.requestedData = {
          code: form.code,
          name: form.name,
          description: form.description,
        };
        if (type === REQUEST_TYPES.PROGRAM && facultyId) {
          requestData.requestedData.facultyId = facultyId;
        }
      }

      // Use public endpoint for unauthenticated requests
      if (isPublic) {
        requestData.guestInfo = guestInfo || { name: "", email: "" };
        await requestsApi.createPublic(requestData);
      } else {
        await requestsApi.create(requestData);
      }
      addToast("Request submitted successfully!", "success");
      setForm({ title: "", message: "", code: "", name: "", description: "" });
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to submit request", "error");
    } finally {
      setLoading(false);
    }
  };

  const isFacultyRequest = type === REQUEST_TYPES.FACULTY;
  const isProgramRequest = type === REQUEST_TYPES.PROGRAM;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-[var(--color-surface)] p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--color-text-3)] hover:text-[var(--color-text)]"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-[var(--color-text)]">
          {getTitle()}
        </h2>
        <p className="mb-4 text-sm text-[var(--color-text-3)]">{getDescription()}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(isFacultyRequest || isProgramRequest) && (
            <>
              <Input
                label="Code"
                name="code"
                placeholder={isFacultyRequest ? "e.g., ENG" : "e.g., CS"}
                value={form.code}
                onChange={handleChange}
                required
              />
              <Input
                label="Name"
                name="name"
                placeholder={isFacultyRequest ? "e.g., Engineering" : "e.g., Computer Science"}
                value={form.name}
                onChange={handleChange}
                required
              />
            </>
          )}

          {(!isFacultyRequest && !isProgramRequest) && (
            <Input
              label="Title"
              name="title"
              placeholder="Brief title for your request"
              value={form.title}
              onChange={handleChange}
              required
            />
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-2)]">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Provide more details about your request..."
              value={form.description}
              onChange={handleChange}
              required
              className="w-full resize-none rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
