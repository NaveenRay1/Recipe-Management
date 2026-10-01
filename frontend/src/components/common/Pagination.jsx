import { ChevronLeft, ChevronRight } from 'lucide-react';

// Returns e.g. [1, '…', 4, 5, 6, '…', 10]
function pageList(page, total) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm';

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <button className={`${btn} border border-line bg-white disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink/50">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined} className={`${btn} ${p === page ? 'bg-primary text-white' : 'border border-line bg-white hover:bg-primary-soft'}`}>
            {p}
          </button>
        )
      )}
      <button className={`${btn} border border-line bg-white disabled:opacity-40`} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}