import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PAGE_SIZE = 6;

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    page: current,
    totalPages,
    start,
    end: Math.min(start + pageSize, items.length),
    items: items.slice(start, start + pageSize),
  };
}

export function Pager({
  page,
  totalPages,
  onPageChange,
  className,
  label = "Pagination",
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label={label} className={cn("mt-8 flex items-center justify-center gap-2", className)}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <ul className="flex items-center gap-1">
        {pages.map((p) => (
          <li key={p}>
            <Button
              type="button"
              size="sm"
              variant={p === page ? "default" : "ghost"}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}
