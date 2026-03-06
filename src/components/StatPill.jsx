import React from "react";

export default function StatPill({ label, value }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}