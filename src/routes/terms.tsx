import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: `Terms of Service — ${SITE.name}` },
      { name: "description", content: "Terms governing the use of the OJEX Oil and Gas Services website and services." },
      { property: "og:title", content: "Terms of Service — OJEX" },
      { property: "og:description", content: "Terms and conditions of use." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="Last updated: May 2026" />
      <section className="section">
        <div className="container-x prose-content max-w-3xl space-y-6 text-muted-foreground">
          <p>By accessing this website or engaging OJEX Oil and Gas Services for any procurement, supply, or recruitment service, you agree to the following terms.</p>

          <h2 className="text-2xl font-bold text-foreground">Use of the website</h2>
          <p>Content on this site is provided for general information about our services. Specifications, prices, and availability are indicative and subject to confirmation in a written quotation.</p>

          <h2 className="text-2xl font-bold text-foreground">Quotations and orders</h2>
          <p>All quotations are valid for 14 days unless stated otherwise. Orders are accepted subject to OJEX standard supply conditions, available on request.</p>

          <h2 className="text-2xl font-bold text-foreground">Liability</h2>
          <p>OJEX is not liable for indirect or consequential losses arising from the use of this website. Liability for supplied goods and services is governed by the applicable supply contract.</p>

          <h2 className="text-2xl font-bold text-foreground">Intellectual property</h2>
          <p>All content, logos, and trademarks on this site are the property of OJEX or its licensors and may not be reproduced without written permission.</p>

          <h2 className="text-2xl font-bold text-foreground">Governing law</h2>
          <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

          <h2 className="text-2xl font-bold text-foreground">Contact</h2>
          <p>{SITE.name}<br />{SITE.address}<br />{SITE.phone} · {SITE.email}</p>
        </div>
      </section>
    </>
  );
}
