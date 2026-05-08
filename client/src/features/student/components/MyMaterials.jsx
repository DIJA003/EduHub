import { useDeleteMaterial } from "../../materials/hooks/useMaterials";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import MaterialViewer from "../../../components/common/MaterialViewer";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { timeAgo } from "../../../lib/utils";
import { useState } from "react";

const TYPE_ICON = {
  PDF: "📄",
  Video: "🎬",
  Slides: "📊",
  ZIP: "🗜️",
  Image: "🖼️",
  Other: "📁",
};

const STATUS_LABEL = {
  pending: "⏳ Pending review",
  approved: "✅ Approved",
  rejected: "❌ Rejected",
};

export default function MyMaterials({ materials, loading }) {
  const deleteMutation = useDeleteMaterial();
  const [viewMaterial, setViewMaterial] = useState(null);

  if (loading) return <TableSkeleton rows={3} cols={4} />;

  return (
    <div className="surface overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-bold text-[var(--color-text)]">
          My Uploaded Materials ({materials.length})
        </h2>
      </div>

      {materials.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No materials uploaded yet"
          description="Upload materials above to see them here."
        />
      ) : (
        <table className="w-full">
          <thead className="bg-[var(--color-surface-2)]">
            <tr>
              {["Material", "Course", "Status", "Uploaded", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {materials.map((m) => (
              <tr key={m._id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICON[m.type] || "📁"}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {m.title}
                      </p>
                      {m.fileUrl && m.status === "approved" && (
                        <button
                          onClick={() => setViewMaterial(m)}
                          className="text-xs text-[var(--color-accent)] hover:underline text-left"
                        >
                          View file ↗
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {m.courseRef?.title ? (
                    <Badge variant="blue">{m.courseRef.title}</Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs">
                    {STATUS_LABEL[m.status] || m.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[var(--color-text-3)]">
                  {timeAgo(m.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(m._id)}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <MaterialViewer
        material={viewMaterial}
        onClose={() => setViewMaterial(null)}
      />
    </div>
  );
}
