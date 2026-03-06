function StatsCard({ title, value, icon, iconBg, delta, deltaType }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-3 cursor-default transition-all duration-200 hover:-translate-y-px hover:border-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(36,99,235,0.15)]">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-secondary">{title}</h4>
        {icon && (
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center text-[16px] flex-shrink-0"
            style={{ background: iconBg || "rgba(36,99,235,0.15)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <h2 className="text-[28px] font-bold font-mono text-text-primary tracking-[-1.5px] leading-none">{value}</h2>
      {delta && (
        <span className={`text-[11px] font-semibold flex items-center gap-1 leading-none ${deltaType === "up" ? "text-success" : "text-danger"}`}>
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}

export default StatsCard;