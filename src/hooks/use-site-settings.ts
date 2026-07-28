import { useQuery } from "@tanstack/react-query";

import { getSiteSettings, type PublicSettings } from "@/lib/settings.functions";

export function useSiteSettings(): PublicSettings | null {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  return data ?? null;
}
