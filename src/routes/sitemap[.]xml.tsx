import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://www.ojexoilandgasservices.com";

// Paths that must never be indexed (private / auth / machine endpoints).
const EXCLUDED_EXACT = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/auth",
  "/procurement",
  "/my-applications",
  "/application-status",
  "/reset-password",
  "/forgot-password",
]);
const EXCLUDED_PREFIXES = ["/admin", "/_admin", "/lovable", "/api"];

// Lazy glob: only the module KEYS are used, so no route module is ever loaded.
// This makes the sitemap regenerate itself whenever a route file is added,
// renamed, or removed — no manual list to maintain.
const routeFiles = import.meta.glob("/src/routes/**/*.tsx");

function collectRoutePaths(): string[] {
  const paths = new Set<string>();
  for (const file of Object.keys(routeFiles)) {
    let p = file.replace("/src/routes/", "").replace(/\.tsx$/, "");
    if (p === "__root") continue;
    p = p.replace(/\[\.\]/g, "."); // escaped dots: robots[.]txt -> robots.txt
    p = p.split(".").join("/"); // dot-separated segments -> slashes
    p = p.replace(/\/index$/, "");
    p = p.replace(/\/txt$/, ".txt").replace(/\/xml$/, ".xml");
    const clean = p === "" ? "/" : `/${p}`.replace(/\/+/g, "/");
    if (clean.includes("$") || clean.includes("*")) continue;
    if (clean.split("/").some((seg) => seg.startsWith("_"))) continue;
    if (EXCLUDED_EXACT.has(clean)) continue;
    if (EXCLUDED_PREFIXES.some((x) => clean === x || clean.startsWith(`${x}/`))) continue;
    paths.add(clean);
  }
  paths.add("/");
  return [...paths].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
}


function priorityFor(path: string) {
  if (path === "/") return "1.0";
  if (path.startsWith("/services") || path.startsWith("/products")) return "0.9";
  if (path.startsWith("/blog")) return "0.7";
  return "0.8";
}

function changefreqFor(path: string) {
  if (path === "/" || path.startsWith("/blog") || path.startsWith("/products")) return "daily";
  return "weekly";
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let productSlugs: string[] = [];
        let blogSlugs: string[] = [];
        try {
          const { data } = await supabaseAdmin
            .from("products")
            .select("slug")
            .eq("active", true);
          productSlugs = (data ?? []).map((p) => `/products/${p.slug}`);
        } catch {
          // ignore
        }
        try {
          const { data } = await supabaseAdmin
            .from("blog_posts")
            .select("slug")
            .eq("published", true);
          blogSlugs = (data ?? []).map((p) => `/blog/${p.slug}`);
        } catch {
          // ignore
        }

        const all = [...new Set([...collectRoutePaths(), ...productSlugs, ...blogSlugs])];
        const urls = all
          .map(
            (p) =>
              `  <url>\n    <loc>${BASE_URL}${p === "/" ? "/" : p}</loc>\n    <changefreq>${changefreqFor(p)}</changefreq>\n    <priority>${priorityFor(p)}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
