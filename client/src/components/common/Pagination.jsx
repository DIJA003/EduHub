import Button from "../ui/Button";

export default function Pagination({
  page,
  totalPages,
  pages,
  onPageChange,
  onNext,
  onPrev,
  onPage,
}) {
  const total = totalPages ?? pages ?? 1;
  const changePage = onPageChange ?? onPage;

  if (!total || total <= 1) return null;

  const handleNext = () => {
    if (onNext) onNext();
    else if (changePage && page < total) changePage(page + 1);
  };

  const handlePrev = () => {
    if (onPrev) onPrev();
    else if (changePage && page > 1) changePage(page - 1);
  };

  const getPageNumbers = () => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= total - 2)
      return [total - 4, total - 3, total - 2, total - 1, total];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-white rounded-b-xl">
      <p className="text-xs text-slate-500">
        Page {page} of {total}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          disabled={page <= 1}
          className="px-2"
          aria-label="Previous page"
        >
          ‹
        </Button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => changePage?.(p)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              p === page
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {p}
          </button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={page >= total}
          className="px-2"
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </div>
  );
}
