import { cn } from "../../lib/utils";

const variants = {
  default: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

export default function Badge({ variant = "default", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Convenience exports
export const statusBadge = (status) => {
  const map = {
    active: "green",
    approved: "green",
    completed: "green",
    pending: "yellow",
    draft: "yellow",
    rejected: "red",
    dropped: "red",
    Published: "green",
    Draft: "yellow",
    Archived: "gray",
    Active: "green",
    Suspended: "red",
  };
  return map[status] || "default";
};
