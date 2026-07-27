import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function StickySubscribeBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Free weekly email
          <span className="block font-medium text-foreground">Every Thursday, 5 min read</span>
        </p>
        <Button asChild size="sm">
          <Link to="/" hash="newsletter">
            Subscribe
          </Link>
        </Button>
      </div>
    </div>
  );
}
