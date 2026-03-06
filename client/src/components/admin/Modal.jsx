function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
      style={{ background: "rgba(0,0,0,0.72)", animation: "overlayIn 0.25s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn   { from { opacity: 0; transform: scale(0.95) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>

      <div
        className="w-full max-w-[480px] rounded-xl overflow-hidden relative"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)",
          animation: "modalIn 0.2s cubic-bezier(0.34,1.4,0.64,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="text-[16px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-sm flex items-center justify-center text-[18px] cursor-pointer transition-all duration-150"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--text-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex justify-end items-center gap-2 px-6 py-4"
            style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;