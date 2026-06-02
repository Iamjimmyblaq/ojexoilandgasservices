import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  notFoundComponent: () => (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <h1 className="text-3xl font-bold">Post not found</h1>
        <p className="mt-2 text-muted-foreground">This article may have been removed.</p>
        <Link to="/blog" className="btn-gold mt-6 inline-block">Back to blog</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">{error.message}</div>
  ),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ${SITE.name} Blog` },
      { property: "og:url", content: `/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, content, cover_image_url, author, published_at, published")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <div className="container-x py-20 text-center text-muted-foreground">Loading…</div>;
  if (error || !data) return null;

  return (
    <article className="section">
      <div className="container-x max-w-3xl">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Back to blog</Link>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{data.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.published_at ? new Date(data.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
          {data.author ? ` · ${data.author}` : ""}
        </p>
        {data.cover_image_url && (
          <div className="mt-6 overflow-hidden rounded-lg">
            <img src={data.cover_image_url} alt={data.title} className="w-full" />
          </div>
        )}
        {data.excerpt && <p className="mt-6 text-lg text-muted-foreground">{data.excerpt}</p>}
        <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-[15px] leading-relaxed">
          {data.content}
        </div>
      </div>
    </article>
  );
}
