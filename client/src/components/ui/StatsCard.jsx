import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const iconColors = {
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/20",
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color = "accent",
  trend,
  trendLabel,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "stats-card group",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[var(--text-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-3)] mb-2">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl font-black text-[var(--color-text)] tabular-nums">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={cn(
                  "text-[var(--text-xs)] font-semibold",
                  trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-[var(--color-text-3)]",
                )}
              >
                {trend > 0 ? "+" : ""}{trend}%
              </span>
              {trendLabel && (
                <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center",
              "border transition-all duration-[var(--duration-normal)]",
              "group-hover:scale-110",
              iconColors[color] ?? iconColors.accent,
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="stats-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="skeleton h-3 w-24 mb-3" />
          <div className="skeleton h-9 w-16" />
        </div>
        <div className="skeleton w-12 h-12 rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

export function StatsGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
