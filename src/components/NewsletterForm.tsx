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
  variant?: "light" | "dark" | "band";
  layout?: "inline" | "stacked";
  hideNote?: boolean;
  buttonLabel?: string;
};

export function NewsletterForm({
  source,
  className,
  variant = "light",
  layout = "inline",
  hideNote = false,
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
      <form onSubmit={handleSubmit} className={cn(
          "flex w-full flex-col gap-2",
          layout === "inline" && "sm:flex-row",
        )}>
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
            "h-12 flex-1 rounded-md",
            variant === "dark" &&
              "border-navy-foreground/20 bg-navy-foreground/10 text-navy-foreground placeholder:text-navy-foreground/50",
            variant === "band" &&
              "border-transparent bg-background text-foreground placeholder:text-muted-foreground",
          )}
        />
        <Button
          type="submit"
          size="lg"
          className={cn(
            "h-12 shrink-0",
            variant === "band" &&
              "w-full bg-navy-deep text-navy-foreground hover:bg-navy font-semibold",
          )}
          disabled={status === "loading"}
        >
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : buttonLabel}
        </Button>
      </form>
      {message ? (
        <p
          className={cn(
            "mt-2 text-sm",
            isError
              ? variant === "band"
                ? "text-signal"
                : "text-destructive"
              : variant === "light"
                ? "text-muted-foreground"
                : "text-navy-foreground/80",
          )}
        >
          {message}
        </p>
      ) : hideNote ? null : (
        <p
          className={cn(
            "mt-2 text-xs",
            variant === "light" ? "text-muted-foreground" : "text-navy-foreground/60",
          )}
        >
          One email every Thursday. By subscribing you agree we can email you the newsletter —
          one-click unsubscribe in every issue, and we never share your address.
        </p>
      )}
    </div>
  );
}
