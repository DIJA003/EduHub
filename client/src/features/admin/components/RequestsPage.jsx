import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "../../../lib/api/requests.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "./DataTable";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { formatDate } from "../../../lib/utils";
import { Info, ChevronLeft, ChevronRight } from "lucide-react";

const REQUEST_TYPE_LABELS = {
  enrollment: "Enrollment",
  mentor_assignment: "Mentor Assignment",
  course_access: "Course Access",
  add_faculty: "Add Faculty",
  add_program: "Add Program",
  support: "Support",
  general: "General",
};

const REQUEST_STATUS_STYLES = {
  pending: { variant: "warning", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
  cancelled: { variant: "default", label: "Cancelled" },
};

export default function RequestsPage() {
  const { page, limit, setPage, reset: resetPage } = usePagination();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [action, setAction] = useState("approve"); // 'approve' or 'approve_create'
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Stable callback to prevent modal defocusing on input
  const handleCloseModal = useCallback(() => {
    setReviewModal(false);
    setSelectedRequest(null);
    setResponseMessage("");
    setAction("approve");
  }, []);

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [statusFilter, typeFilter, resetPage]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", { page, limit, status: statusFilter, type: typeFilter }],
    queryFn: () =>
      requestsApi
        .getAll({ page, limit, status: statusFilter, type: typeFilter })
        .then((r) => r.data),
    refetchInterval: 60000, // 1 minute
  });

  const requests = useMemo(() => {
    const arr = Array.isArray(data) ? data : data?.data || [];
    return arr;
  }, [data]);
  const meta = data?.meta;

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, responseMessage, action }) =>
      requestsApi.review(id, { status, responseMessage, action }),
    onSuccess: (res, variables) => {
      const { status } = variables;
      const createdEntity = res.data?.createdEntity;

      if (status === "approved" && createdEntity) {
        toast.success(`Request approved and entity created!`);
      } else if (status === "approved") {
        toast.success(`Request approved successfully!`);
        
        // Navigate to create page if approving without auto-create
        if (selectedRequest?.type === "add_faculty" && selectedRequest?.requestedData) {
          const { code, name, description } = selectedRequest.requestedData;
          const queryParams = new URLSearchParams();
          if (code) queryParams.set("code", code);
          if (name) queryParams.set("name", name);
          if (description) queryParams.set("description", description);
          navigate(`/admin/faculties?${queryParams.toString()}`);
        } else if (selectedRequest?.type === "add_program" && selectedRequest?.requestedData) {
          const { code, name, description, facultyId } = selectedRequest.requestedData;
          const queryParams = new URLSearchParams();
          if (code) queryParams.set("code", code);
          if (name) queryParams.set("name", name);
          if (description) queryParams.set("description", description);
          if (facultyId) queryParams.set("faculty", facultyId);
          navigate(`/admin/programs?${queryParams.toString()}`);
        }
      } else {
        toast.success(`Request rejected.`);
      }

      qc.invalidateQueries({ queryKey: ["admin-requests"] });
      setReviewModal(false);
      setSelectedRequest(null);
      setResponseMessage("");
      setAction("approve");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to review request");
    },
  });

  const submitReview = () => {
    if (!selectedRequest) return;
    reviewMutation.mutate({
      id: selectedRequest._id,
      status: action === "approve" || action === "approve_create" ? "approved" : "rejected",
      responseMessage,
      action: action === "approve_create" ? "create" : undefined,
    });
  };

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <span className="font-medium text-[var(--color-text)]">
          {REQUEST_TYPE_LABELS[r.type] || r.type}
        </span>
      ),
    },
    {
      key: "requester",
      label: "Requester",
      render: (r) => (
        <div>
          <div className="font-medium text-[var(--color-text)]">
            {r.requester?.name || r.guestInfo?.name || "Unknown"}
          </div>
          <div className="text-xs text-[var(--color-text-3)]">
            {r.requester?.email || r.guestInfo?.email || ""}
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: "Title / Details",
      render: (r) => (
        <div className="max-w-xs">
          <div className="font-medium text-[var(--color-text)] truncate">
            {r.title || r.message?.substring(0, 50) || "No title"}
          </div>
          {(r.type === "add_faculty" || r.type === "add_program") && r.requestedData && (
            <div className="text-xs text-[var(--color-text-3)] mt-1">
              Code: {r.requestedData.code}, Name: {r.requestedData.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "faculty",
      label: "Faculty",
      render: (r) => (
        <span className="text-sm text-[var(--color-text-2)]">
          {r.faculty?.code || r.faculty?.name || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const style = REQUEST_STATUS_STYLES[r.status];
        return <Badge variant={style.variant}>{style.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (r) => (
        <span className="text-sm text-[var(--color-text-3)]">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) =>
        r.status === "pending" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedRequest(r);
                setAction("approve");
                setReviewModal(true);
              }}
              disabled={reviewMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-green-600 bg-transparent border border-green-600 rounded-md hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRequest(r);
                setAction("reject");
                setReviewModal(true);
              }}
              disabled={reviewMutation.isPending}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-transparent border border-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Requests Management</h1>
          <p className="text-sm text-[var(--color-text-3)]">
            Review and manage user requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="add_faculty">Add Faculty</option>
            <option value="add_program">Add Program</option>
            <option value="enrollment">Enrollment</option>
            <option value="support">Support</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={requests}
        loading={isLoading}
        emptyState={
          <div className="text-center py-12">
            <Info className="mx-auto h-12 w-12 text-[var(--color-text-3)]" />
            <p className="mt-2 text-[var(--color-text-3)]">No requests found</p>
          </div>
        }
      />

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[var(--color-text-3)]">
            Showing {((meta.page - 1) * meta.limit) + 1}-{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} requests
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || reviewMutation.isPending}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="px-3 py-2 text-sm text-[var(--color-text-2)] min-w-[100px] text-center">
              Page {meta.page || page} of {meta.totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= meta.totalPages || reviewMutation.isPending}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        open={reviewModal}
        onClose={handleCloseModal}
        title={`${action === "reject" ? "Reject" : "Approve"} Request`}
      >
        <div className="space-y-4">
          {selectedRequest && (
            <div className="bg-[var(--color-surface-2)] p-3 rounded-lg">
              <div className="text-sm font-medium text-[var(--color-text)]">
                {REQUEST_TYPE_LABELS[selectedRequest.type] || selectedRequest.type}
              </div>
              <div className="text-sm text-[var(--color-text-2)]">
                {selectedRequest.title || selectedRequest.message?.substring(0, 100)}
              </div>
              {(selectedRequest.type === "add_faculty" || selectedRequest.type === "add_program") &&
                selectedRequest.requestedData && (
                  <div className="mt-2 text-xs text-[var(--color-text-3)]">
                    <strong>Proposed Data:</strong>
                    <div>Code: {selectedRequest.requestedData.code}</div>
                    <div>Name: {selectedRequest.requestedData.name}</div>
                    {selectedRequest.requestedData.facultyId && (
                      <div>For Faculty: {selectedRequest.faculty?.code || selectedRequest.faculty?.name || selectedRequest.requestedData.facultyId}</div>
                    )}
                  </div>
                )}
            </div>
          )}

          {(selectedRequest?.type === "add_faculty" || selectedRequest?.type === "add_program") &&
            action !== "reject" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createEntity"
                  checked={action === "approve_create"}
                  onChange={(e) => setAction(e.target.checked ? "approve_create" : "approve")}
                  className="rounded border-[var(--color-border-2)]"
                />
                <label htmlFor="createEntity" className="text-sm text-[var(--color-text-2)]">
                  Auto-create {selectedRequest?.type === "add_faculty" ? "faculty" : "program"} upon approval
                </label>
              </div>
            )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
              Response Message (optional)
            </label>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Enter your response to the requester..."
              rows={3}
              className="w-full rounded-lg border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setReviewModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              loading={reviewMutation.isPending}
              variant={action === "reject" ? "danger" : "primary"}
              className="flex-1"
            >
              {action === "reject" ? "Reject Request" : "Approve Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
