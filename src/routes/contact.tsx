import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { SITE } from "@/lib/site";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: `Contact — ${SITE.name}` },
      { name: "description", content: `Contact OJEX Oil and Gas Services. Phone ${SITE.phone}, email ${SITE.email}, office in Port Harcourt, Nigeria.` },
      { property: "og:title", content: "Contact OJEX" },
      { property: "og:description", content: "Reach our team in Port Harcourt." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

function Contact() {
  return (
    <>
      <PageHero eyebrow="Get in Touch" title="Talk to our procurement & operations team." subtitle="We respond to all inquiries within 24 hours." />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <Card icon={MapPin} title="Office"><p>{SITE.address}</p></Card>
            <Card icon={Phone} title="Phone"><a className="hover:text-[color:var(--gold)]" href={SITE.phoneHref}>{SITE.phone}</a></Card>
            <Card icon={Mail} title="Email"><a className="hover:text-[color:var(--gold)]" href={`mailto:${SITE.email}`}>{SITE.email}</a></Card>
            <Card icon={MessageCircle} title="WhatsApp"><a className="hover:text-[color:var(--gold)]" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">{SITE.whatsappNumber}</a></Card>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-card p-8">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <p className="mt-2 text-sm text-muted-foreground">Fill in the form and our team will be in touch.</p>
              <div className="mt-6"><ContactForm /></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({ icon: Icon, title, children }: any) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[color:var(--gold)]" />
        <h3 className="text-sm font-semibold uppercase tracking-widest">{title}</h3>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
