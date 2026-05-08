import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "../../../components/common/EmptyStat";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import Badge from "../../../components/ui/Badges";
import { formatDateTime } from "../../../lib/utils";
import {
  FileCheck,
  Upload,
  MessageSquare,
  UserCheck,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";

const LOG_ICONS = {
  review: FileCheck,
  upload: Upload,
  comment: MessageSquare,
  enrollment: UserCheck,
  view: Eye,
};

// Mock data for mentor activity logs
const MOCK_LOGS = [
  {
    _id: "1",
    type: "review",
    title: "Reviewed student submission",
    description: "Approved 'Data Structures Assignment' by Ahmed Hassan",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: "completed",
  },
  {
    _id: "2",
    type: "upload",
    title: "Uploaded course material",
    description: "Added 'Lecture Notes: Algorithms Complexity' to CS201",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "completed",
  },
  {
    _id: "3",
    type: "comment",
    title: "Provided feedback",
    description: "Left review comments on 'Database Design Project'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: "completed",
  },
  {
    _id: "4",
    type: "enrollment",
    title: "New student enrolled",
    description: "Sarah Johnson enrolled in 'Advanced Programming'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "completed",
  },
  {
    _id: "5",
    type: "review",
    title: "Material review pending",
    description: "Requested changes for 'Web Development Quiz' by Mohamed Ali",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hours ago
    status: "pending",
  },
  {
    _id: "6",
    type: "view",
    title: "Viewed student progress",
    description: "Checked progress reports for 12 students in CS301",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: "completed",
  },
];

export default function MentorLogs() {
  const [filter, setFilter] = useState("all");

  // In a real implementation, this would fetch from an API
  const { data, isLoading } = useQuery({
    queryKey: ["mentor-logs"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_LOGS;
    },
  });

  const logs = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((log) => log.type === filter);
  }, [logs, filter]);

  const filterOptions = [
    { value: "all", label: "All Activity" },
    { value: "review", label: "Reviews" },
    { value: "upload", label: "Uploads" },
    { value: "comment", label: "Feedback" },
    { value: "enrollment", label: "Enrollments" },
  ];

  if (isLoading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-text)]">Activity Logs</h1>
            <p className="text-sm text-[var(--color-text-3)] mt-1">
              Track your mentoring activities and student interactions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-3)]">
            <Clock className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border transition-colors ${
                filter === option.value
                  ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Reviews", value: logs.filter((l) => l.type === "review").length, icon: FileCheck },
          { label: "Uploads", value: logs.filter((l) => l.type === "upload").length, icon: Upload },
          { label: "Feedback", value: logs.filter((l) => l.type === "comment").length, icon: MessageSquare },
          { label: "Students", value: logs.filter((l) => l.type === "enrollment").length, icon: UserCheck },
        ].map((stat) => (
          <div
            key={stat.label}
            className="surface p-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--color-text)]">{stat.value}</p>
              <p className="text-xs text-[var(--color-text-3)]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Logs List */}
      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No activity logs"
            description="Your mentoring activities will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((log) => {
              const IconComponent = LOG_ICONS[log.type] || Eye;
              return (
                <article
                  key={log._id}
                  className="p-4 sm:p-5 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${
                        log.status === "completed"
                          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                          : "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                      }`}
                    >
                      {log.status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            {log.title}
                          </h3>
                          <p className="text-sm text-[var(--color-text-2)] mt-0.5">
                            {log.description}
                          </p>
                        </div>
                        <Badge
                          variant={log.status === "completed" ? "success" : "warning"}
                          className="shrink-0"
                        >
                          {log.status === "completed" ? "Done" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-text-3)] mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
