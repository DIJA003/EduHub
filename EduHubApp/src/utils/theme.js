// Mirrors the CSS variables in admin.css / global-dark.css
export const colors = {
  bgBase:        '#0d1117',
  bgSurface:     '#161b22',
  bgCard:        '#1c2333',
  bgHover:       '#21293a',
  border:        '#30363d',
  borderFocus:   '#2463eb',
  textPrimary:   '#e6edf3',
  textSecondary: '#8b949e',
  textMuted:     '#484f58',
  accent:        '#2463eb',
  accentLight:   '#3b82f6',
  accentGlow:    'rgba(36,99,235,0.15)',
  success:       '#22c55e',
  successBg:     'rgba(34,197,94,0.12)',
  warning:       '#f59e0b',
  warningBg:     'rgba(245,158,11,0.12)',
  danger:        '#ef4444',
  dangerBg:      'rgba(239,68,68,0.10)',
  info:          '#38bdf8',
  infoBg:        'rgba(56,189,248,0.12)',
  white:         '#ffffff',
};

export const spacing = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32 };
export const radius  = { sm:4, md:8, lg:12, xl:16, full:9999 };
export const fontSize = { xs:11, sm:12, md:13, base:14, lg:16, xl:18, xxl:22, huge:28 };
export const fontWeight = { normal:'400', medium:'500', semibold:'600', bold:'700' };

export const badgeVariants = {
  success: { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  danger:  { bg: 'rgba(239,68,68,0.10)',  text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
  blue:    { bg: 'rgba(36,99,235,0.15)',  text: '#3b82f6', border: 'rgba(36,99,235,0.25)' },
  default: { bg: '#1c2333',              text: '#8b949e', border: '#30363d' },
};
