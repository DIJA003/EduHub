import { useState, useMemo, useRef, useEffect, useId } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Accessible searchable single-select — works offline from a static option list.
 */
export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  required,
  disabled,
  hint,
  error,
  emptyMessage = "No matches",
}) {
  const listId = useId();
  const btnId = useId();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrap = useRef(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (o) =>
        String(o.label).toLowerCase().includes(needle) ||
        (o.description &&
          String(o.description).toLowerCase().includes(needle)) ||
        String(o.value).toLowerCase().includes(needle),
    );
  }, [options, q]);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value],
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hasErr = Boolean(error);

  return (
    <div className="relative flex flex-col gap-1.5" ref={wrap}>
      {label && (
        <label
          id={`${btnId}-label`}
          htmlFor={btnId}
          className="text-[var(--text-sm)] font-medium text-[var(--color-text-2)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger)]" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      <button
        id={btnId}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={label ? `${btnId}-label` : undefined}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] px-3.5 py-2.5 text-left text-[var(--text-sm)] transition-colors",
          "bg-[var(--color-surface-2)] text-[var(--color-text)]",
          "border focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-accent-glow)]",
          hasErr
            ? "border-[var(--color-danger)]"
            : "border-[var(--color-border-2)] hover:border-[var(--color-accent)]/50",
          disabled && "cursor-not-allowed opacity-55",
        )}
      >
        <span className={cn(!selected && "text-[var(--color-text-3)]")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          strokeWidth={1.75}
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--color-text-3)] transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {hasErr ? (
        <p className="text-[var(--text-xs)] text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">{hint}</p>
      ) : null}

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-[var(--z-dropdown)] mt-1.5 flex max-h-[min(320px,60vh)] w-full flex-col overflow-hidden rounded-[var(--radius-lg)]",
            "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)]",
          )}
        >
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
            <Search
              strokeWidth={1.75}
              className="h-4 w-4 shrink-0 text-[var(--color-text-3)]"
              aria-hidden
            />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "min-h-10 w-full bg-transparent py-2 text-[var(--text-sm)] outline-none placeholder:text-[var(--color-text-3)]",
                "text-[var(--color-text)]",
              )}
              autoCapitalize="off"
              autoCorrect="off"
              aria-autocomplete="list"
              aria-controls={listId}
            />
          </div>
          <ul
            id={listId}
            role="listbox"
            className="no-scrollbar overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center text-[var(--text-sm)] text-[var(--color-text-3)]">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((o) => (
                <li key={String(o.value)} role="option" aria-selected={value === o.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-[var(--text-sm)] transition-colors",
                      String(value) === String(o.value)
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
                    )}
                    onClick={() => {
                      onChange(String(o.value));
                      setOpen(false);
                      setQ("");
                    }}
                  >
                    <span className="font-medium">{o.label}</span>
                    {o.description && (
                      <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
                        {o.description}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
