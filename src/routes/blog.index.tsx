import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: `Blog & News — ${SITE.name}` },
      { name: "description", content: "Industry insights, project updates, and announcements from OJEX Oil and Gas Services." },
      { property: "og:title", content: `Blog & News — ${SITE.name}` },
      { property: "og:description", content: "Industry insights, project updates, and announcements from OJEX Oil and Gas Services." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

function BlogIndex() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image_url, author, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHero eyebrow="News & Insights" title="OJEX blog." subtitle="Industry updates, sourcing insights, and project highlights." />
      <section className="section">
        <div className="container-x">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : !data || data.length === 0 ? (
            <p className="text-center text-muted-foreground">New articles coming soon. Subscribe to our newsletter to be notified.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-lg">
                  {p.cover_image_url ? (
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      <img src={p.cover_image_url} alt={p.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-[color:var(--navy-deep)] to-[color:var(--gold)]" />
                  )}
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
                      {p.author ? ` · ${p.author}` : ""}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug">{p.title}</h2>
                    {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
