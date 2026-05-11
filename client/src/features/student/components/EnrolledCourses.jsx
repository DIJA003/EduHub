import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useUnenroll } from "../../enrollment/hooks/useEnrollments";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/common/EmptyStat";
import { ConfirmDialog } from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";

const ITEMS_PER_PAGE = 6;

function CourseCard({ enrollment, onUnenroll }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative card hover overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" strokeWidth={1.75} />
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
            Open Course
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EnrolledCourses({ enrollments, loading }) {
  const navigate = useNavigate();
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [page, setPage] = useState(1);
  const unenrollMutation = useUnenroll();

  const totalPages = Math.ceil(enrollments.length / ITEMS_PER_PAGE);
  const paginatedEnrollments = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return enrollments.slice(start, start + ITEMS_PER_PAGE);
  }, [enrollments, page]);

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedEnrollments.map((enrollment, i) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, enrollments.length)} of {enrollments.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-[var(--text-sm)] text-[var(--color-text)]">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
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
