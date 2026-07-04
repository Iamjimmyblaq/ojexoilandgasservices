import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { INDUSTRIES, SITE } from "@/lib/site";

export const Route = createFileRoute("/industries")({
  component: () => (
    <>
      <PageHero eyebrow="Industries" title="Industries we serve." subtitle="From upstream operators to industrial users — OJEX powers them all." />
      <section className="section"><div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INDUSTRIES.map(i => (
          <div key={i.name} className="card-elevated">
            <h2 className="text-lg font-bold">{i.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{i.desc}</p>
          </div>
        ))}
      </div></section>
    </>
  ),
  head: () => ({ meta: [{ title: `Industries — ${SITE.name}` }, { name: "description", content: "Industries served by OJEX Oil and Gas Services." }, { property: "og:url", content: "/industries" }], links: [{ rel: "canonical", href: "/industries" }] }),
});
