import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${SITE.name}` },
      { name: "description", content: "How OJEX Oil and Gas Services collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — OJEX" },
      { property: "og:description", content: "Our commitment to data protection and privacy." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Last updated: May 2026" />
      <section className="section">
        <div className="container-x prose-content max-w-3xl space-y-6 text-muted-foreground">
          <p>OJEX Oil and Gas Services ("OJEX", "we", "us") respects your privacy. This policy explains what information we collect when you use our website or submit forms, how we use it, and your rights.</p>

          <h2 className="text-2xl font-bold text-foreground">Information we collect</h2>
          <p>We collect information you provide directly: name, company, email, phone number, and any details you include in quote requests, vendor registrations, job applications, or contact messages.</p>

          <h2 className="text-2xl font-bold text-foreground">How we use it</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To respond to inquiries, quotes, and procurement requests</li>
            <li>To evaluate vendor and job applications</li>
            <li>To send service updates and newsletters (you may opt out at any time)</li>
            <li>To comply with legal and regulatory obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground">Data sharing</h2>
          <p>We do not sell personal data. We may share information with vetted suppliers strictly to fulfil your request, or with regulators where legally required.</p>

          <h2 className="text-2xl font-bold text-foreground">Data security</h2>
          <p>Information is stored on secured infrastructure with role-based access. We retain personal data only as long as necessary for the purposes stated above.</p>

          <h2 className="text-2xl font-bold text-foreground">Your rights</h2>
          <p>You may request access, correction, or deletion of your personal data at any time by emailing <a className="text-[color:var(--gold)] underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

          <h2 className="text-2xl font-bold text-foreground">Contact</h2>
          <p>{SITE.name}<br />{SITE.address}<br />{SITE.phone} · {SITE.email}</p>
        </div>
      </section>
    </>
  );
}
