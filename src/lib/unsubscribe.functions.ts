import { createServerFn } from "@tanstack/react-start";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public, token-gated unsubscribe. The token is a random UUID stored against the
 * subscriber row and only ever shared inside that subscriber's own emails.
 */
export const unsubscribeByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => ({ token: String(data.token ?? "") }))
  .handler(async ({ data }): Promise<{ ok: boolean; email: string | null }> => {
    if (!UUID.test(data.token)) return { ok: false, email: null };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() } as never)
      .eq("unsubscribe_token", data.token)
      .select("email")
      .maybeSingle();

    if (error || !row) return { ok: false, email: null };
    return { ok: true, email: (row as { email: string }).email };
  });
