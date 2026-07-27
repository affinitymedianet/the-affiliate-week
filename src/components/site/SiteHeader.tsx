import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TYPEFORM_SUBMIT_URL } from "@/lib/site";

const links = [
  { label: "Archive", to: "/archive" as const },
  { label: "Jobs", to: "/jobs" as const },
  { label: "Deals", to: "/deals" as const },
  { label: "Events", to: "/events" as const },
  { label: "Sponsor", to: "/sponsor" as const },
  { label: "FAQ", to: "/" as const, hash: "faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-navy font-display text-xs font-bold text-navy-foreground">
            AW
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            The Affiliate Week
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={link.hash}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <a
              href={TYPEFORM_SUBMIT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Submit
            </a>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link to="/" hash="newsletter" onClick={() => setOpen(false)}>
                Subscribe free
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
