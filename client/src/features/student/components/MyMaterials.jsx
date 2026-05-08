import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Video, Image, FileArchive, File, Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { useDeleteMaterial } from "../../materials/hooks/useMaterials";
import { SkeletonList } from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/common/EmptyStat";
import MaterialViewer from "../../../components/common/MaterialViewer";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { ConfirmDialog } from "../../../components/ui/Modal";
import { timeAgo } from "../../../lib/utils";
import { cn } from "../../../lib/utils";

const TYPE_ICONS = {
  PDF: FileText,
  Video: Video,
  Slides: FileText,
  ZIP: FileArchive,
  Image: Image,
  Other: File,
};

const TYPE_COLORS = {
  PDF: "text-red-400 bg-red-500/15",
  Video: "text-purple-400 bg-purple-500/15",
  Slides: "text-amber-400 bg-amber-500/15",
  ZIP: "text-cyan-400 bg-cyan-500/15",
  Image: "text-emerald-400 bg-emerald-500/15",
  Other: "text-[var(--color-text-3)] bg-[var(--color-surface-3)]",
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "warning", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "success", label: "Approved" },
  rejected: { icon: XCircle, color: "danger", label: "Rejected" },
};

function MaterialCard({ material, onView, onDelete }) {
  const Icon = TYPE_ICONS[material.type] || TYPE_ICONS.Other;
  const colorClass = TYPE_COLORS[material.type] || TYPE_COLORS.Other;
  const status = STATUS_CONFIG[material.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-2)] transition-all duration-[var(--duration-fast)]"
    >
      <div className={cn(
        "w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0",
        colorClass
      )}>
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
            {material.title}
          </h4>
          <Badge variant={status.color} className="shrink-0">
            <StatusIcon className="w-3 h-3 mr-1" strokeWidth={2} />
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-[var(--text-xs)] text-[var(--color-text-3)]">
          {material.courseRef?.title && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" strokeWidth={2} />
              {material.courseRef.title}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={2} />
            {timeAgo(material.createdAt)}
          </span>
        </div>

        {material.feedback && (
          <p className="text-[var(--text-xs)] text-[var(--color-text-2)] mt-2 p-2 bg-[var(--color-surface-3)] rounded-[var(--radius-sm)] border-l-2 border-[var(--color-accent)]">
            {material.feedback}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {material.fileUrl && material.status === "approved" && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onView(material)}
            title="View file"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onDelete(material)}
          className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </motion.div>
  );
}

export default function MyMaterials({ materials, loading }) {
  const deleteMutation = useDeleteMaterial();
  const [viewMaterial, setViewMaterial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (loading) {
    return (
      <div className="surface p-5">
        <div className="skeleton h-5 w-40 mb-4" />
        <SkeletonList items={3} />
      </div>
    );
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget._id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  return (
    <>
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text)]">
              My Materials
            </h2>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-0.5">
              {materials.length} upload{materials.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {materials.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" strokeWidth={1.5} />}
            title="No materials uploaded yet"
            description="Upload your first material to get started."
          />
        ) : (
          <div className="space-y-3">
            {materials.map((material, i) => (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <MaterialCard
                  material={material}
                  onView={setViewMaterial}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MaterialViewer
        material={viewMaterial}
        onClose={() => setViewMaterial(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete material?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
