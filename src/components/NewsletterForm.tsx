import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Enter your email address" })
  .email({ message: "That doesn't look like a valid email" })
  .max(255, { message: "Email must be under 255 characters" });

type Props = {
  source: "hero" | "footer" | "cta";
  className?: string;
  variant?: "light" | "dark";
  buttonLabel?: string;
};

export function NewsletterForm({
  source,
  className,
  variant = "light",
  buttonLabel = "Subscribe",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setIsError(true);
      setMessage(parsed.error.issues[0].message);
      return;
    }

    setStatus("loading");
    setMessage(null);

    const { error } = await supabase
      .from("subscribers")
      .insert({ email: parsed.data.toLowerCase(), source });

    if (error && error.code !== "23505") {
      setStatus("idle");
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
    setIsError(false);
    setEmail("");
    setMessage("You're in. The next issue lands in your inbox on Thursday.");
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        <label htmlFor={`email-${source}`} className="sr-only">
          Email address
        </label>
        <Input
          id={`email-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          maxLength={255}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(
            "h-11 flex-1 rounded-md",
            variant === "dark" &&
              "border-navy-foreground/20 bg-navy-foreground/10 text-navy-foreground placeholder:text-navy-foreground/50",
          )}
        />
        <Button type="submit" size="lg" className="h-11 shrink-0" disabled={status === "loading"}>
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : buttonLabel}
        </Button>
      </form>
      {message ? (
        <p
          className={cn(
            "mt-2 text-sm",
            isError
              ? "text-destructive"
              : variant === "dark"
                ? "text-navy-foreground/80"
                : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : (
        <p
          className={cn(
            "mt-2 text-xs",
            variant === "dark" ? "text-navy-foreground/60" : "text-muted-foreground",
          )}
        >
          One email every Thursday. No spam, unsubscribe anytime.
        </p>
      )}
    </div>
  );
}
