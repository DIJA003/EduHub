/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // All colors reference CSS variables — auto-switch on .light / default dark
        base:            "var(--bg-base)",
        surface:         "var(--bg-surface)",
        card:            "var(--bg-card)",
        hover:           "var(--bg-hover)",
        border:          "var(--border)",
        "border-light":  "var(--border-light)",
        "border-focus":  "var(--border-focus)",

        accent:          "var(--accent)",
        "accent-light":  "var(--accent-light)",
        "accent-glow":   "var(--accent-glow)",

        success:         "var(--success)",
        "success-bg":    "var(--success-bg)",
        warning:         "var(--warning)",
        "warning-bg":    "var(--warning-bg)",
        danger:          "var(--danger)",
        "danger-bg":     "var(--danger-bg)",
        info:            "var(--info)",
        "info-bg":       "var(--info-bg)",

        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        xs:   "4px",
        sm:   "6px",
        md:   "10px",
        lg:   "14px",
        xl:   "18px",
        full: "9999px",
      },
      boxShadow: {
        xs:     "0 1px 2px rgba(0,0,0,0.08)",
        sm:     "0 1px 4px rgba(0,0,0,0.10)",
        md:     "0 4px 12px rgba(0,0,0,0.12)",
        lg:     "0 8px 28px rgba(0,0,0,0.16)",
        xl:     "0 20px 48px rgba(0,0,0,0.20)",
        accent: "0 4px 14px rgba(36,99,235,0.35)",
      },
    },
  },
  plugins: [],
};