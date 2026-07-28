import { useQuery } from "@tanstack/react-query";

import { listIssues, type Issue } from "@/lib/issues.functions";

/** The most recent published issue, used for homepage teasers. */
export function useLatestIssue(): Issue | undefined {
  const { data } = useQuery({ queryKey: ["issues"], queryFn: () => listIssues() });
  return data?.[0];
}
