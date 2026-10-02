import Link from "next/link";
import Icon from "@/components/store/Icon";
import { buildHref, type CatalogState } from "./query";

function pageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export default function Pagination({ state, total, page, pageCount }: { state: CatalogState; total: number; page: number; pageCount: number }) {
  const from = (page - 1) * state.limit + 1;
  const to = Math.min(total, page * state.limit);
  const href = (p: number) => buildHref(state, { page: p });
  const arrow = "w-11 h-11 rounded-full flex items-center justify-center transition-colors";

  return (
    <div className="mt-6 bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">
        Showing <span className="font-bold text-on-surface">{from} - {to}</span> of <span className="font-bold text-on-surface">{total}</span> groceries
      </p>
      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {page > 1 ? (
            <Link href={href(page - 1)} aria-label="Previous page" scroll className={`${arrow} text-on-surface hover:bg-surface-container-low`}>
              <Icon name="chevron_left" className="text-lg" />
            </Link>
          ) : (
            <span aria-hidden="true" className={`${arrow} text-outline-variant opacity-40`}><Icon name="chevron_left" className="text-lg" /></span>
          )}
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`g${i}`} aria-hidden="true" className="px-1 text-outline font-bold">...</span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-11 h-11 rounded-full flex items-center justify-center font-label-md text-label-md transition-colors ${p === page ? "bg-primary text-on-primary font-bold shadow-sm" : "text-on-surface hover:bg-surface-container-low font-semibold"}`}
              >
                {p}
              </Link>
            ),
          )}
          {page < pageCount ? (
            <Link href={href(page + 1)} aria-label="Next page" className={`${arrow} text-on-surface hover:bg-surface-container-low`}>
              <Icon name="chevron_right" className="text-lg" />
            </Link>
          ) : (
            <span aria-hidden="true" className={`${arrow} text-outline-variant opacity-40`}><Icon name="chevron_right" className="text-lg" /></span>
          )}
        </nav>
      )}
    </div>
  );
}
