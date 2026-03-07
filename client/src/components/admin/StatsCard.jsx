// Icon backgrounds per card — use CSS variables so they adapt to light/dark
const ICON_BG_MAP = {
  blue:   { bg: "var(--accent-glow)",   color: "var(--accent-light)"   },
  green:  { bg: "var(--success-bg)",    color: "var(--success)"        },
  amber:  { bg: "var(--warning-bg)",    color: "var(--warning)"        },
  red:    { bg: "var(--danger-bg)",     color: "var(--danger)"         },
  info:   { bg: "var(--info-bg)",       color: "var(--info)"           },
};

function StatsCard({ title, value, icon, iconColor = "blue", delta, deltaType }) {
  const iconStyle = ICON_BG_MAP[iconColor] || ICON_BG_MAP.blue;

  return (
    <div
      className="p-5 rounded-lg flex flex-col gap-3 cursor-default transition-all duration-200 hover:-translate-y-px"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px var(--accent-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4
          className="text-[11px] font-bold uppercase tracking-[0.07em]"
          style={{ color: "var(--text-secondary)" }}
        >
          {title}
        </h4>
        {icon && (
          <div
            className="w-9 h-9 rounded-sm flex items-center justify-center text-[16px] flex-shrink-0"
            style={{ background: iconStyle.bg, color: iconStyle.color }}
          >
            {icon}
          </div>
        )}
      </div>

      <h2
        className="text-[28px] font-bold font-mono tracking-[-1.5px] leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </h2>

      {delta && (
        <span
          className="text-[11px] font-semibold flex items-center gap-1 leading-none"
          style={{ color: deltaType === "up" ? "var(--success)" : "var(--danger)" }}
        >
          {deltaType === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}

export default StatsCard;