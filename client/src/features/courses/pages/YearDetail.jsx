import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardShell from "../../../components/layout/DashboardShell";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import {
  useEnroll,
  useUnenroll,
  useMyEnrollments,
} from "../hooks/useEnrollments";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";
import { useToasts } from "../../../hooks/useToasts";

export default function YearDetail() {
  const { yearId } = useParams();
  const dbUser = useAuthStore((s) => s.dbUser);
  const { addToast } = useToasts();
  const [confirmUnenroll, setConfirmUnenroll] = useState(null); // courseId

  const { data: courses = [], isLoading: loadCourses } = useQuery({
    queryKey: ["courses", "year", yearId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/year/${yearId}`);
      return res.data?.data || [];
    },
    enabled: !!yearId,
  });

  const { data: enrollments = [] } = useMyEnrollments();
  const enrollMut = useEnroll();
  const unenrollMut = useUnenroll();

  const enrolledSet = new Set(enrollments.map((e) => e.courseId || e.id));

  const handleEnroll = async (courseId) => {
    try {
      await enrollMut.mutateAsync(courseId);
      addToast("Enrolled successfully!", "success");
    } catch (err) {
      addToast(err.message || "Enrollment failed.", "error");
    }
  };

  const handleUnenroll = async (courseId) => {
    setConfirmUnenroll(null);
    try {
      await unenrollMut.mutateAsync(courseId);
      addToast("Unenrolled.", "info");
    } catch (err) {
      addToast(err.message || "Unenroll failed.", "error");
    }
  };

  return (
    <DashboardShell title="Year Courses" user={dbUser}>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/academic-year"
          className="text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          ← Academic Years
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">Courses</span>
      </div>

      <h2 className="mb-6 text-xl font-black text-slate-900">
        Available Courses
        <span className="ml-2 text-sm font-medium text-slate-400">
          ({courses.length})
        </span>
      </h2>

      {loadCourses ? (
        <LoadingSkeleton rows={4} />
      ) : !courses.length ? (
        <EmptyState
          icon="📭"
          title="No courses available"
          description="No courses have been published for this academic year yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isEnrolled = enrolledSet.has(course._id || course.id);
            const enrollment = enrollments.find(
              (e) =>
                e.courseId === (course._id || course.id) ||
                e.id === (course._id || course.id),
            );
            return (
              <div
                key={course._id || course.id}
                className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {course.code}
                      </span>
                      <h3 className="mt-0.5 font-bold text-slate-900 leading-snug">
                        {course.title}
                      </h3>
                    </div>
                    <Badge variant="info">{course.creditHours || 3} cr</Badge>
                  </div>
                  {course.instructor && (
                    <p className="mt-2 text-xs text-slate-500">
                      👨‍🏫 {course.instructor}
                    </p>
                  )}
                  {isEnrolled && enrollment?.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-bold">
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 p-4 flex gap-2">
                  {isEnrolled ? (
                    <>
                      <Link
                        to={`/academic-year/${yearId}/course/${course._id || course.id}`}
                        className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                      >
                        Continue learning →
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConfirmUnenroll(course._id || course.id)
                        }
                      >
                        Unenroll
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1"
                      loading={enrollMut.isPending}
                      onClick={() => handleEnroll(course._id || course.id)}
                    >
                      Enroll
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmUnenroll}
        title="Unenroll from course"
        message="Are you sure? Your progress will be reset if you re-enroll later."
        confirmLabel="Unenroll"
        variant="danger"
        onConfirm={() => handleUnenroll(confirmUnenroll)}
        onCancel={() => setConfirmUnenroll(null)}
      />
    </DashboardShell>
  );
}
