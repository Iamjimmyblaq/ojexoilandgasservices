import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/blog")({
  component: () => (
    <>
      <PageHero eyebrow="News & Insights" title="OJEX blog." subtitle="Industry updates, sourcing insights, and project highlights." />
      <section className="section">
        <div className="container-x text-center text-muted-foreground">
          <p>New articles coming soon. Subscribe to our newsletter to be notified.</p>
        </div>
      </section>
    </>
  ),
  head: () => ({ meta: [{ title: `Blog — ${SITE.name}` }, { name: "description", content: "OJEX news, insights, and updates." }, { property: "og:url", content: "/blog" }], links: [{ rel: "canonical", href: "/blog" }] }),
});
