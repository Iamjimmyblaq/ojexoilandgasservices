import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

const FAQS = [
  { q: "What regions do you serve?", a: "We are headquartered in Port Harcourt and primarily serve Nigeria and West Africa, with international sourcing from EU, US, China, UAE, and Singapore." },
  { q: "Are your products certified?", a: "Yes — we supply API, ISO, and OEM-certified equipment. Certificates of conformance are issued with every shipment." },
  { q: "What is your typical lead time?", a: "Stock items: 2–7 days within Nigeria. International orders: 3–8 weeks depending on origin and category." },
  { q: "Do you offer credit terms?", a: "Credit terms are available to qualified clients after KYC and credit review. Standard payment is 30% advance, 70% on delivery." },
  { q: "Can you help with manpower for a project?", a: "Yes. We provide short-term and long-term staffing, including OPITO-certified offshore crews and senior technical leads." },
  { q: "How do I become a vendor?", a: "Submit our vendor registration form and our procurement team will review and contact you for pre-qualification." },
];

export const Route = createFileRoute("/faqs")({
  component: () => (
    <>
      <PageHero eyebrow="Help" title="Frequently asked questions." />
      <section className="section"><div className="container-x mx-auto max-w-3xl space-y-4">
        {FAQS.map((f, i) => (
          <details key={i} className="group rounded-lg border border-border bg-card p-5 transition-all open:shadow-md">
            <summary className="cursor-pointer list-none text-base font-semibold marker:hidden">{f.q}<span className="float-right text-[color:var(--gold)] transition-transform group-open:rotate-45">+</span></summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div></section>
    </>
  ),
  head: () => ({
    meta: [{ title: `FAQs — ${SITE.name}` }, { name: "description", content: "Answers to common questions about sourcing, lead times, and vendor onboarding." }, { property: "og:url", content: "/faqs" }],
    links: [{ rel: "canonical", href: "/faqs" }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    })}],
  }),
});
