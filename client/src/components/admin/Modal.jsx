function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/70 backdrop-blur-[4px]"
      style={{ animation: "overlayIn 0.25s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
      `}</style>
      <div
        className="bg-surface border border-border rounded-xl w-full max-w-[480px] shadow-xl overflow-hidden relative"
        style={{ animation: "modalIn 0.2s cubic-bezier(0.34,1.4,0.64,1)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h3 className="text-[16px] font-bold text-text-primary tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] bg-card border border-border text-text-muted rounded-sm flex items-center justify-center text-[16px] transition-all hover:text-text-primary hover:bg-hover hover:border-text-muted cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end items-center gap-2 px-6 py-4 border-t border-border bg-card">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;