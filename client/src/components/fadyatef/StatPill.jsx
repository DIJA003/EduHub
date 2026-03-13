import React from "react";

export default function StatPill({ label, value }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-slate-900">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}