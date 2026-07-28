import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-settings";
import logoAsset from "@/assets/taw-logo.png.asset.json";

const links = [
  { label: "Archive", to: "/archive" as const },
  { label: "Jobs", to: "/jobs" as const },
  { label: "Deals", to: "/deals" as const },
  { label: "Events", to: "/events" as const },
  { label: "Sponsor", to: "/sponsor" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();
  const logoSrc = settings?.logoUrl || logoAsset.url;
  const siteName = settings?.siteName || "The Affiliate Week";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <img
            src={logoSrc}
            alt={siteName}
            className="h-9 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}

              className="font-display text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild size="sm">
            <Link to="/submit">Submit</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-1 inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3 sm:px-6 lg:px-8">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}

                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 font-display text-base font-semibold text-foreground hover:bg-muted hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link to="/submit" onClick={() => setOpen(false)}>
                Submit
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
