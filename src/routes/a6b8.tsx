import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { currentUser, signIn } from "@/integrations/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAsset from "@/assets/taw-logo.png.asset.json";

const title = "Staff sign in — The Affiliate Week";
const description = "Private sign in for The Affiliate Week editorial team.";

export const Route = createFileRoute("/a6b8")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState(0);
  const attempts = useRef(0);

  useEffect(() => {
    currentUser().then((user) => {
      if (user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Date.now() < lockedUntil) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      attempts.current = 0;
      navigate({ to: "/admin", replace: true });
    } catch {
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        attempts.current = 0;
        setError("Too many attempts. Try again in a few minutes.");
      } else {
        // Deliberately generic: never reveal whether the address exists.
        setError("Invalid email or password.");
      }
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  const locked = Date.now() < lockedUntil;

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-5 py-16">
      <div className="w-full max-w-md rounded-xl bg-background p-8 shadow-card">
        <Link to="/" className="block">
          <img src={logoAsset.url} alt="The Affiliate Week" className="mx-auto h-10 w-auto" />
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-bold">Staff sign in</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Private area. Accounts are created by an administrator only.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              autoComplete="username"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={72}
              autoComplete="current-password"
              className="mt-1.5"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={busy || locked}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 block text-center text-sm font-medium text-primary hover:underline"
        >
          ← Back to the site
        </Link>
      </div>
    </div>
  );
}
