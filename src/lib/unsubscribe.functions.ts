import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsGet, fsUpdate, nowIso } from "@/integrations/firebase/firestore";

const TOKEN = /^[0-9a-zA-Z-]{16,64}$/;

/**
 * Public, token-gated unsubscribe. Each subscriber document is keyed by a
 * random token that only ever appears in that subscriber's own emails, so
 * knowing the token is the authorisation.
 */
export async function unsubscribeByToken({
  data,
}: {
  data: { token: string };
}): Promise<{ ok: boolean; email: string | null }> {
  const token = String(data.token ?? "");
  if (!TOKEN.test(token)) return { ok: false, email: null };

  const row = await fsGet(COLLECTIONS.subscribers, token);
  if (!row) return { ok: false, email: null };

  await fsUpdate(COLLECTIONS.subscribers, token, {
    status: "unsubscribed",
    unsubscribed_at: nowIso(),
  });

  return { ok: true, email: typeof row.email === "string" ? row.email : null };
}
