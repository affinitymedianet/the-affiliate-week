import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-navy-deep pb-20 text-navy-foreground md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-navy-foreground font-display text-sm font-bold text-navy-deep">
              A
            </span>
            <span className="font-display text-lg font-bold">AffiliateX</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-navy-foreground/70">
            The weekly email for affiliate marketers — industry news, jobs, events and offers,
            every Thursday.
          </p>
          <p className="mt-4 text-sm text-navy-foreground/60">affiliatex.co</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-foreground/90">
            Newsletter
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
            <li>
              <Link to="/" hash="newsletter" className="hover:text-navy-foreground">
                Subscribe
              </Link>
            </li>
            <li>
              <Link to="/archive" className="hover:text-navy-foreground">
                Read the archive
              </Link>
            </li>
            <li>
              <Link to="/" hash="inside" className="hover:text-navy-foreground">
                What's inside
              </Link>
            </li>
            <li>
              <Link to="/" hash="faq" className="hover:text-navy-foreground">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-foreground/90">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
            <li>
              <Link to="/jobs" className="hover:text-navy-foreground">
                Affiliate jobs
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:text-navy-foreground">
                Affiliate events
              </Link>
            </li>
            <li>
              <Link to="/deals" className="hover:text-navy-foreground">
                Exclusive deals
              </Link>
            </li>
            <li>
              <Link to="/submit" className="hover:text-navy-foreground">
                Submit an event, job or offer
              </Link>
            </li>
            <li>
              <Link to="/sponsor" className="hover:text-navy-foreground">
                Sponsor the newsletter
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-navy-foreground/90">
            Contact & legal
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
            <li>
              <a href="mailto:hello@affiliatex.co" className="hover:text-navy-foreground">
                hello@affiliatex.co
              </a>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-navy-foreground">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-navy-foreground">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AffiliateX. All rights reserved.</p>
          <p>
            Postal address: add your registered mailing address here (required on bulk email).
          </p>
        </div>
      </div>
    </footer>
  );
}
