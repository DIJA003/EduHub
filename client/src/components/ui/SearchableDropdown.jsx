import { useState, useRef, useEffect, useMemo } from "react";
import { cn, initials } from "../../lib/utils";

export default function SearchableDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Search…",
  emptyMessage = "No results found",
  required = false,
  disabled = false,
  renderOption,
  getOptionKey = (o) => o._id || o.id || o.value,
  getOptionLabel = (o) => o.name || o.label || o.title || String(o),
  getOptionSubtitle = (o) => o.email || o.code || o.subtitle || "",
  getOptionAvatar = (o) => o.photoURL || null,
  showAvatar = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => getOptionKey(o) === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const s = search.toLowerCase();
    return options.filter(
      (o) =>
        getOptionLabel(o).toLowerCase().includes(s) ||
        getOptionSubtitle(o).toLowerCase().includes(s)
    );
  }, [options, search, getOptionLabel, getOptionSubtitle]);

  // Close on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  const handleSelect = (option) => {
    onChange(getOptionKey(option));
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] text-left",
          "border border-[var(--color-border-2)] bg-[var(--color-surface-2)]",
          "hover:border-[var(--color-accent)] transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {showAvatar && selected && (
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white text-[var(--text-xs)] font-bold flex items-center justify-center shrink-0 overflow-hidden">
            {getOptionAvatar(selected) ? (
              <img
                src={getOptionAvatar(selected)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              initials(getOptionLabel(selected))
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {selected ? (
            <div>
              <p className="text-[var(--color-text)] font-medium truncate">
                {getOptionLabel(selected)}
              </p>
              {getOptionSubtitle(selected) && (
                <p className="text-[var(--text-xs)] text-[var(--color-text-3)] truncate">
                  {getOptionSubtitle(selected)}
                </p>
              )}
            </div>
          ) : (
            <span className="text-[var(--color-text-3)]">{placeholder}</span>
          )}
        </div>
        <svg
          className={cn(
            "w-4 h-4 text-[var(--color-text-3)] transition-transform",
            open && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 w-full mt-1",
            "bg-[var(--color-surface)] border border-[var(--color-border)]",
            "rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]",
            "overflow-hidden"
          )}
        >
          {/* Search input */}
          <div className="p-2 border-b border-[var(--color-border)]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search…"
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)]",
                  "bg-[var(--color-surface-2)] border border-[var(--color-border-2)]",
                  "text-[var(--color-text)] text-[var(--text-sm)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                )}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-[var(--color-text-3)]">
                <svg
                  className="w-10 h-10 mx-auto mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[var(--text-sm)]">{emptyMessage}</p>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-[var(--text-xs)] text-[var(--color-text-3)] border-b border-[var(--color-border)]">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
                {filtered.map((option) => {
                  const key = getOptionKey(option);
                  const isSelected = key === value;

                  if (renderOption) {
                    return (
                      <div
                        key={key}
                        onClick={() => handleSelect(option)}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-[var(--color-accent-soft)]"
                        )}
                      >
                        {renderOption(option, isSelected)}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left",
                        "hover:bg-[var(--color-surface-2)] transition-colors",
                        isSelected && "bg-[var(--color-accent-soft)]"
                      )}
                    >
                      {showAvatar && (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-[var(--text-xs)] font-bold flex items-center justify-center shrink-0 overflow-hidden">
                          {getOptionAvatar(option) ? (
                            <img
                              src={getOptionAvatar(option)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials(getOptionLabel(option))
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"
                        )}>
                          {getOptionLabel(option)}
                        </p>
                        {getOptionSubtitle(option) && (
                          <p className="text-[var(--text-xs)] text-[var(--color-text-3)] truncate">
                            {getOptionSubtitle(option)}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-[var(--color-accent)] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
