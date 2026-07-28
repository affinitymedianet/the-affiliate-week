import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  /** Absolute site path, e.g. "/jobs". Omit for the current page. */
  href?: string;
};

const SITE = "https://theaffiliateweek.com";

/**
 * Breadcrumb trail + BreadcrumbList structured data.
 * The last crumb is always rendered as the current page.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${SITE}${crumb.href === "/" ? "" : crumb.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-current opacity-70">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" /> : null}
              {isLast || !crumb.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-medium opacity-100">
                  {crumb.label}
                </span>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <Link to={crumb.href as any} className="transition-colors hover:underline">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}
