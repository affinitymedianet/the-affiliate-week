import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { unsubscribeByToken } from "@/lib/unsubscribe.functions";

const title = "Unsubscribe — The Affiliate Week";
const description =
  "Unsubscribe from The Affiliate Week newsletter in one click. No questions, no retention emails.";

type UnsubscribeSearch = { token: string };

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>): UnsubscribeSearch => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"idle" | "working" | "done" | "failed">("idle");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("failed");
      return;
    }
    setState("working");
    unsubscribeByToken({ data: { token } })
      .then((result) => {
        setEmail(result.email);
        setState(result.ok ? "done" : "failed");
      })
      .catch(() => setState("failed"));
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Unsubscribe</h1>
        {state === "working" || state === "idle" ? (
          <p className="mt-4 text-muted-foreground">Removing you from the list…</p>
        ) : state === "done" ? (
          <p className="mt-4 text-muted-foreground">
            Done{email ? ` — ${email}` : ""} will not receive The Affiliate Week again. If you
            change your mind, you can subscribe again from any page.
          </p>
        ) : (
          <p className="mt-4 text-muted-foreground">
            That unsubscribe link is not valid or has already been used. Email{" "}
            <a className="text-primary hover:underline" href="mailto:hello@theaffiliateweek.com">
              hello@theaffiliateweek.com
            </a>{" "}
            and we will remove you manually.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
