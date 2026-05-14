import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STATIC_PATHS = [
  "/", "/about", "/services", "/products", "/industries", "/projects",
  "/careers", "/contact", "/quote", "/blog", "/faqs", "/vendor-registration",
  "/services/procurement", "/services/equipment", "/services/diesel",
  "/services/recruitment", "/services/logistics", "/services/safety",
  "/services/offshore", "/services/vendor-management",
  "/privacy", "/terms",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        let productSlugs: string[] = [];
        try {
          const { data } = await supabaseAdmin
            .from("products")
            .select("slug")
            .eq("active", true);
          productSlugs = (data ?? []).map((p) => `/products/${p.slug}`);
        } catch {
          // ignore
        }
        const all = [...STATIC_PATHS, ...productSlugs];
        const urls = all
          .map((p) => `  <url><loc>${origin}${p}</loc></url>`)
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
