// ─── Reusable theme-aware CSS variable helpers ─────────────────────────────

// Raw class strings (non-color parts only — colors via inline style)
export const tw = {
  btnSm: "!px-3 !py-1.5 !text-[12.5px]",
  th:    "px-5 py-[11px] text-left text-[10.5px] font-bold uppercase tracking-[0.07em] border-b whitespace-nowrap last:text-right",
  td:    "px-5 py-[13px] text-[13.5px] border-b align-middle last:text-right",
  trHover: "transition-colors duration-150",
  tableWrap: "rounded-lg overflow-hidden",
  formLabel: "text-[11px] font-bold uppercase tracking-[0.07em]",
};

// ─── Button components ───────────────────────────────────────────────────────
function useHoverStyle(base, hover) {
  return {
    onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, base),
  };
}

export function BtnPrimary({ onClick, children, className = "" }) {
  const base  = { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff" };
  const hov   = { background: "var(--accent-light)", borderColor: "var(--accent-light)" };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97] ${className}`}
      style={base}
      {...useHoverStyle(base, hov)}
    >
      {children}
    </button>
  );
}

export function BtnSecondary({ onClick, children, className = "" }) {
  const base = { background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text-secondary)" };
  const hov  = { background: "var(--bg-hover)", color: "var(--text-primary)", borderColor: "var(--text-muted)" };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97] ${className}`}
      style={base}
      {...useHoverStyle(base, hov)}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ onClick, children, className = "" }) {
  const base = { background: "transparent", borderColor: "var(--danger)", color: "var(--danger)" };
  const hov  = { background: "var(--danger-bg)" };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97] ${className}`}
      style={base}
      {...useHoverStyle(base, hov)}
    >
      {children}
    </button>
  );
}

// Keep tw.btnPrimary etc as strings for inline usage (backwards compat) --------
tw.btnPrimary   = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border cursor-pointer active:scale-[0.97] bg-accent text-white border-accent hover:bg-accent-light";
tw.btnSecondary = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border cursor-pointer active:scale-[0.97] bg-card border-border text-text-secondary hover:bg-hover hover:text-text-primary";
tw.btnDanger    = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold border cursor-pointer active:scale-[0.97] border-danger text-danger hover:bg-danger-bg";

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  success: { bg: "var(--success-bg)", color: "var(--success)",        border: "rgba(34,197,94,0.25)"  },
  warning: { bg: "var(--warning-bg)", color: "var(--warning)",        border: "rgba(245,158,11,0.25)" },
  danger:  { bg: "var(--danger-bg)",  color: "var(--danger)",         border: "rgba(239,68,68,0.25)"  },
  blue:    { bg: "var(--accent-glow)",color: "var(--accent-light)",   border: "rgba(36,99,235,0.25)"  },
  info:    { bg: "var(--info-bg)",    color: "var(--info)",           border: "rgba(56,189,248,0.25)" },
  default: { bg: "var(--bg-card)",    color: "var(--text-secondary)", border: "var(--border)"         },
};

export function Badge({ variant = "default", children, mono }) {
  const s = BADGE_STYLES[variant] || BADGE_STYLES.default;
  return (
    <span
      className={`inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold ${mono ? "font-mono text-[10.5px] tracking-[0.03em]" : ""}`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  );
}

// ─── FormGroup ───────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className={tw.formLabel}
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── FormInput / FormSelect ───────────────────────────────────────────────────
const inputBase = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
};

export function FormInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-[9px] rounded-sm text-[13.5px] outline-none appearance-none"
      style={inputBase}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--border-focus)";
        e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
        e.target.style.background = "var(--bg-hover)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border)";
        e.target.style.boxShadow = "none";
        e.target.style.background = "var(--bg-card)";
      }}
    />
  );
}

export function FormSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-[9px] pr-7 rounded-sm text-[13.5px] outline-none appearance-none cursor-pointer"
        style={inputBase}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--border-focus)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px]"
        style={{ color: "var(--text-muted)" }}
      >▼</span>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1
          className="text-[22px] font-bold tracking-[-0.5px] leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── TableWrap ────────────────────────────────────────────────────────────────
export function TableWrap({ toolbar, children, footer }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
    >
      {toolbar && (
        <div
          className="flex items-center justify-between px-5 gap-3 min-h-[52px] py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div
          className="flex items-center justify-between px-5 py-3 gap-3"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// ─── TableSearch ─────────────────────────────────────────────────────────────
export function TableSearch({ value, onChange, placeholder }) {
  return (
    <input
      className="px-3 py-[6px] rounded-sm text-[12.5px] w-[220px] outline-none"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
      placeholder={placeholder || "Search..."}
      value={value}
      onChange={onChange}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--border-focus)";
        e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-8 gap-3">
      <div className="text-[40px] leading-none opacity-60 mb-1">{icon}</div>
      <h3 className="text-[14.5px] font-semibold tracking-[-0.2px]" style={{ color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p className="text-[12.5px] max-w-[300px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {description}
      </p>
    </div>
  );
}