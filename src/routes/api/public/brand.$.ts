import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/brand/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = String((params as { _splat?: string })._splat ?? "");
        if (!key || key.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("brand").download(key);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
