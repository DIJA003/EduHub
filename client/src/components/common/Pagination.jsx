import Button from "../ui/Button";

export default function Pagination({ page, pages, onNext, onPrev, onPage }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        Page {page} of {pages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onPrev}
          disabled={page <= 1}
        >
          Previous
        </Button>

        {pages <= 7
          ? Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPage?.(p)}
                className="w-8"
              >
                {p}
              </Button>
            ))
          : null}

        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={page >= pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
