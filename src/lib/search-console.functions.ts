import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE_ORIGIN = "https://www.ojexoilandgasservices.com";

export const KEY_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Homepage" },
  { path: "/faqs", label: "AI FAQ content (answer engine source)" },
  { path: "/services", label: "Services index" },
  { path: "/services/chemicals", label: "Chemicals supply" },
  { path: "/services/lpg", label: "LPG skid & supply" },
  { path: "/services/procurement", label: "Procurement & sourcing" },
  { path: "/services/recruitment", label: "Manpower & HR" },
  { path: "/products", label: "Products catalogue" },
  { path: "/blog", label: "Blog / news" },
];

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

const inputSchema = z.object({ site_url: z.string().trim().max(300).optional() });

export const getIndexingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { listVerifiedProperties, inspectUrl, getSitemapStatus } = await import("@/lib/search-console.server");

    let candidates: string[];
    try {
      candidates = await listVerifiedProperties(`${SITE_ORIGIN}/`);
    } catch (err) {
      return {
        status: "unavailable" as const,
        message: err instanceof Error ? err.message : "Search Console is unavailable.",
        candidates: [] as string[],
        siteUrl: null,
        pages: [],
        sitemap: null,
        checkedAt: new Date().toISOString(),
      };
    }

    if (candidates.length === 0) {
      return {
        status: "no_property" as const,
        message: "No verified Search Console property covers this site.",
        candidates,
        siteUrl: null,
        pages: [],
        sitemap: null,
        checkedAt: new Date().toISOString(),
      };
    }

    let siteUrl: string;
    if (data.site_url) {
      if (!candidates.includes(data.site_url)) throw new Error("That Search Console property is not verified for this site.");
      siteUrl = data.site_url;
    } else if (candidates.length === 1) {
      siteUrl = candidates[0]!;
    } else {
      return {
        status: "selection_required" as const,
        message: "Multiple verified properties cover this site — choose one.",
        candidates,
        siteUrl: null,
        pages: [],
        sitemap: null,
        checkedAt: new Date().toISOString(),
      };
    }

    const pages = await Promise.all(
      KEY_PAGES.map((p) => inspectUrl(siteUrl, `${SITE_ORIGIN}${p.path}`, p.label)),
    );
    const sitemap = await getSitemapStatus(siteUrl, `${SITE_ORIGIN}/sitemap.xml`);

    return {
      status: "ok" as const,
      message: null,
      candidates,
      siteUrl,
      pages,
      sitemap,
      checkedAt: new Date().toISOString(),
    };
  });
