function StatsCard({ title, value, icon, iconBg, delta, deltaType }) {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <h4>{title}</h4>
        {icon && (
          <div className="stats-card-icon" style={{ background: iconBg || "var(--accent-glow)" }}>
            {icon}
          </div>
        )}
      </div>
      <h2>{value}</h2>
      {delta && (
        <span className={`stats-card-delta ${deltaType === "up" ? "delta-up" : "delta-down"}`}>
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}

export default StatsCard;