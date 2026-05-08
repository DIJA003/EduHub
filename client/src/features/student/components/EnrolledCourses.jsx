import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Play, CheckCircle, ExternalLink, LogOut } from "lucide-react";
import { useUnenroll } from "../../enrollment/hooks/useEnrollments";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/common/EmptyStat";
import { ConfirmDialog } from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { cn } from "../../../lib/utils";

function CourseCard({ enrollment, onUnenroll }) {
  const navigate = useNavigate();
  const isComplete = enrollment.progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative card hover overflow-hidden"
    >
      {/* Progress indicator bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-surface-3)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${enrollment.progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            isComplete ? "bg-[var(--color-success)]" : "bg-[var(--color-accent)]"
          )}
        />
      </div>

      <div className="p-5 pt-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0",
            isComplete
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
          )}>
            {isComplete ? (
              <CheckCircle className="w-6 h-6" strokeWidth={1.75} />
            ) : (
              <BookOpen className="w-6 h-6" strokeWidth={1.75} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <button
                onClick={() => navigate(`/academic-year/${enrollment.yearId}/course/${enrollment.courseId}`)}
                className="text-[var(--text-base)] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors text-left truncate"
              >
                {enrollment.name}
              </button>
              <Badge variant="blue">{enrollment.code}</Badge>
            </div>

            <div className="flex items-center gap-3 text-[var(--text-xs)] text-[var(--color-text-3)] mb-3">
              <span className="flex items-center gap-1">
                {isComplete ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                    <span className="text-emerald-400 font-medium">Completed</span>
                  </>
                ) : enrollment.nextItem ? (
                  <>
                    <Play className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="truncate max-w-[150px]">{enrollment.nextItem}</span>
                  </>
                ) : (
                  "Not started"
                )}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isComplete ? "bg-emerald-400" : "bg-[var(--color-accent)]"
                  )}
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
              <span className={cn(
                "text-[var(--text-xs)] font-mono font-semibold tabular-nums",
                isComplete ? "text-emerald-400" : "text-[var(--color-text-3)]"
              )}>
                {enrollment.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onUnenroll(enrollment)}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
          >
            Unenroll
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => navigate(`/academic-year/${enrollment.yearId}/course/${enrollment.courseId}`)}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            {isComplete ? "Review" : "Continue"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EnrolledCourses({ enrollments, loading }) {
  const navigate = useNavigate();
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const unenrollMutation = useUnenroll();

  if (loading) {
    return (
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-9 w-32 rounded-[var(--radius-md)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text)]">
              My Courses
            </h2>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-0.5">
              {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/academic-year")}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Browse More
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8" strokeWidth={1.5} />}
            title="No courses enrolled"
            description="Browse available courses to get started on your learning journey."
            action={() => navigate("/academic-year")}
            actionLabel="Browse Courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment, i) => (
              <motion.div
                key={enrollment.enrollmentId || enrollment.courseId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CourseCard
                  enrollment={enrollment}
                  onUnenroll={setUnenrollTarget}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!unenrollTarget}
        title="Unenroll from course?"
        message={`Are you sure you want to unenroll from "${unenrollTarget?.name}"? Your progress will be saved but you'll need to re-enroll to continue.`}
        confirmLabel="Unenroll"
        onConfirm={() =>
          unenrollMutation.mutate(unenrollTarget.courseId, {
            onSuccess: () => setUnenrollTarget(null),
          })
        }
        onCancel={() => setUnenrollTarget(null)}
        loading={unenrollMutation.isPending}
      />
    </>
  );
}
