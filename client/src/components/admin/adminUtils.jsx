// Reusable Tailwind class strings for admin components

export const tw = {
  // Buttons
  btnPrimary:   "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold bg-accent text-white border border-accent transition-all duration-150 hover:bg-accent-light hover:border-accent-light shadow-xs cursor-pointer active:scale-[0.97]",
  btnSecondary: "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold bg-card border border-border text-text-secondary transition-all duration-150 hover:bg-hover hover:text-text-primary hover:border-text-muted cursor-pointer active:scale-[0.97]",
  btnDanger:    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-[13.5px] font-semibold bg-transparent border border-danger text-danger transition-all duration-150 hover:bg-danger-bg cursor-pointer active:scale-[0.97]",
  btnSm:        "!px-3 !py-1.5 !text-[12.5px]",

  // Badges
  badgeSuccess: "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-success-bg text-success border border-success/20",
  badgeWarning: "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-warning-bg text-warning border border-warning/20",
  badgeDanger:  "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-danger-bg  text-danger  border border-danger/20",
  badgeBlue:    "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-[var(--accent-glow)] text-accent-light border border-accent/20",
  badgeDefault: "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-card text-text-secondary border border-border",
  badgeInfo:    "inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold bg-info-bg text-info border border-info/20",

  // Form inputs
  formInput:  "w-full bg-card border border-border text-text-primary px-3 py-[9px] rounded-sm text-[13.5px] outline-none transition-all placeholder:text-text-muted focus:border-border-focus focus:shadow-[0_0_0_3px_var(--accent-glow)] focus:bg-hover appearance-none",
  formLabel:  "text-[11px] font-bold uppercase tracking-[0.07em] text-text-secondary",
  formSelect: "w-full bg-card border border-border text-text-primary px-3 py-[9px] rounded-sm text-[13.5px] outline-none transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_var(--accent-glow)] focus:bg-hover appearance-none cursor-pointer",

  // Table
  tableWrap: "bg-surface border border-border rounded-lg overflow-hidden shadow-sm",
  th:        "px-5 py-[11px] text-left text-[10.5px] font-bold uppercase tracking-[0.07em] text-text-muted border-b border-border whitespace-nowrap last:text-right",
  td:        "px-5 py-[13px] text-[13.5px] text-text-primary border-b border-border-light align-middle last:text-right",
  trHover:   "transition-colors duration-150 hover:bg-hover",
};

export function Badge({ variant = "default", children, mono }) {
  const cls = {
    success: tw.badgeSuccess,
    warning: tw.badgeWarning,
    danger:  tw.badgeDanger,
    blue:    tw.badgeBlue,
    info:    tw.badgeInfo,
    default: tw.badgeDefault,
  }[variant] || tw.badgeDefault;

  return (
    <span className={cls + (mono ? " font-mono text-[10.5px] tracking-[0.03em]" : "")}>
      {children}
    </span>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={tw.formLabel}>{label}</label>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.5px] text-text-primary leading-tight">{title}</h1>
        {subtitle && <p className="text-[12.5px] text-text-secondary mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function TableWrap({ toolbar, children, footer }) {
  return (
    <div className={tw.tableWrap}>
      {toolbar && (
        <div className="flex items-center justify-between px-5 border-b border-border gap-3 min-h-[52px] py-3">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-8 gap-3">
      <div className="text-[40px] leading-none opacity-60 mb-1">{icon}</div>
      <h3 className="text-[14.5px] font-semibold text-text-primary tracking-[-0.2px]">{title}</h3>
      <p className="text-[12.5px] text-text-muted max-w-[300px] leading-relaxed">{description}</p>
    </div>
  );
}