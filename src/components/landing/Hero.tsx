import heroImage from "@/assets/hero-dashboard.jpg";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Hero() {
  return (
    <section id="newsletter" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Weekly · Every Thursday · Free
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Your complete affiliate marketing{" "}
            <span className="text-primary">resource hub</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            AffiliateX is a weekly newsletter for affiliate marketers. Industry news, new
            programmes and offers, affiliate jobs and the events worth attending — filtered down
            to one email you can read in five minutes.
          </p>

          <div className="mt-7 max-w-md">
            <NewsletterForm source="hero" buttonLabel="Subscribe free" />
          </div>

          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["JD", "MK", "SR", "AL"].map((initials) => (
                <span
                  key={initials}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-surface bg-navy text-[11px] font-semibold text-navy-foreground"
                >
                  {initials}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Joined by <span className="font-semibold text-foreground">5,200+</span> affiliates,
              media buyers and partnership managers
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
            <img
              src={heroImage}
              alt="Affiliate marketing performance dashboard on a laptop"
              width={1280}
              height={960}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-4 rounded-lg border border-border bg-background px-4 py-3 shadow-card">
            <p className="font-display text-xl font-bold">Issue #148</p>
            <p className="text-xs text-muted-foreground">Out this Thursday</p>
          </div>
        </div>
      </div>
    </section>
  );
}
