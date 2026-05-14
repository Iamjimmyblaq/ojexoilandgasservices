import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/quote")({
  component: Quote,
  head: () => ({
    meta: [
      { title: `Request a Quote — ${SITE.name}` },
      { name: "description", content: "Request a competitive quote on industrial equipment, base oil/diesel, PPE, or oilfield manpower." },
      { property: "og:title", content: "Request a Quote — OJEX" },
      { property: "og:url", content: "/quote" },
    ],
    links: [{ rel: "canonical", href: "/quote" }],
  }),
});

function Quote() {
  return (
    <>
      <PageHero eyebrow="RFQ" title="Request a quote." subtitle="Tell us what you need — we'll respond within 24 hours with pricing, lead time, and terms." />
      <section className="section">
        <div className="container-x mx-auto max-w-3xl rounded-lg border border-border bg-card p-8">
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
