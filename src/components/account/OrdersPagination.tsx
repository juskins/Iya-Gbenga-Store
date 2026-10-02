import Link from "next/link";
import Icon from "@/components/store/Icon";

type Props = { page: number; pageCount: number; total: number; hrefFor: (page: number) => string };

export default function OrdersPagination({ page, pageCount, total, hrefFor }: Props) {
  if (pageCount <= 1) return null;
  const btn = "inline-flex items-center justify-center gap-1 min-h-11 px-3 sm:px-4 rounded-full font-label-md text-label-md font-bold";
  return (
    <nav aria-label="Pagination" className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${btn} text-primary hover:bg-surface-container-low`}>
          <Icon name="chevron_left" className="text-lg" /> Previous
        </Link>
      ) : (
        <span aria-hidden="true" className={`${btn} text-outline-variant opacity-40`}><Icon name="chevron_left" className="text-lg" /> Previous</span>
      )}
      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        Page <span className="font-bold text-on-surface">{page}</span> of {pageCount} · {total} orders
      </p>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={`${btn} text-primary hover:bg-surface-container-low`}>
          Next <Icon name="chevron_right" className="text-lg" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${btn} text-outline-variant opacity-40`}>Next <Icon name="chevron_right" className="text-lg" /></span>
      )}
    </nav>
  );
}
