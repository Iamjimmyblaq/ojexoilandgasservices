import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { VendorForm } from "@/components/forms/VendorForm";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/vendor-registration")({
  component: Vendor,
  head: () => ({
    meta: [
      { title: `Vendor Registration — ${SITE.name}` },
      { name: "description", content: "Register as a supplier or vendor with OJEX Oil and Gas Services." },
      { property: "og:title", content: "Vendor Registration — OJEX" },
      { property: "og:url", content: "/vendor-registration" },
    ],
    links: [{ rel: "canonical", href: "/vendor-registration" }],
  }),
});

function Vendor() {
  return (
    <>
      <PageHero eyebrow="Suppliers" title="Become an OJEX vendor." subtitle="Join our pre-qualified supplier pool. We work with OEMs, distributors, and specialist manufacturers worldwide." />
      <section className="section">
        <div className="container-x mx-auto max-w-3xl rounded-lg border border-border bg-card p-8">
          <VendorForm />
        </div>
      </section>
    </>
  );
}
