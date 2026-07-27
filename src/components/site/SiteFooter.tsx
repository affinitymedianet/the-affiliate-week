import { Link } from "@tanstack/react-router";

const linkClass =
  "text-navy-foreground/70 transition-colors hover:text-signal";

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep pb-20 text-navy-foreground md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-xs font-bold text-primary-foreground">
              AW
            </span>
            <span className="font-display text-lg font-bold">The Affiliate Week</span>
          </div>

          <p className="mt-3 max-w-xs text-sm text-navy-foreground/70">
            The weekly email for affiliate marketers — industry news, jobs, events and offers,
            every Thursday.
          </p>
          <a
            href="https://theaffiliateweek.com"
            className="mt-4 inline-block text-sm font-medium text-signal hover:underline"
          >
            theaffiliateweek.com
          </a>
        </div>

        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-signal">
            Newsletter
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/" hash="newsletter" className={linkClass}>
                Subscribe
              </Link>
            </li>
            <li>
              <Link to="/archive" className={linkClass}>
                Read the archive
              </Link>
            </li>
            <li>
              <Link to="/" hash="inside" className={linkClass}>
                What's inside
              </Link>
            </li>
            <li>
              <Link to="/" hash="faq" className={linkClass}>
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-signal">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/jobs" className={linkClass}>
                Affiliate jobs
              </Link>
            </li>
            <li>
              <Link to="/events" className={linkClass}>
                Affiliate events
              </Link>
            </li>
            <li>
              <Link to="/deals" className={linkClass}>
                Exclusive deals
              </Link>
            </li>
            <li>
              <Link to="/submit" className={linkClass}>
                Submit an event, job or offer
              </Link>
            </li>
            <li>
              <Link to="/sponsor" className={linkClass}>
                Sponsor the newsletter
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-signal">
            Contact & legal
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="mailto:hello@theaffiliateweek.com" className={linkClass}>
                hello@theaffiliateweek.com
              </a>
            </li>
            <li>
              <Link to="/privacy" className={linkClass}>
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className={linkClass}>
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Affiliate Week. All rights reserved.</p>
          <p>
            Postal address: add your registered mailing address here (required on bulk email).
          </p>
        </div>
      </div>
    </footer>
  );
}
