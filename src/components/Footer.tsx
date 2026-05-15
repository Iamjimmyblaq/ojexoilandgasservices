import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE, NAV_PRIMARY, SERVICE_LINKS } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import logo from "@/assets/ojex-logo.png";

export function Footer() {
  return (
    <footer className="bg-[color:var(--navy-deep)] text-white/80">
      <div className="container-x grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={logo} alt="OJEX Oil and Gas Services" className="h-16 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Trusted partner for industrial sourcing, equipment supply, base oil distribution, and oilfield manpower across West Africa.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a href={SITE.phoneHref} className="flex items-start gap-2 hover:text-[color:var(--gold)]"><Phone className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" />{SITE.phone}</a>
            <a href={`mailto:${SITE.email}`} className="flex items-start gap-2 hover:text-[color:var(--gold)]"><Mail className="mt-0.5 h-4 w-4 text-[color:var(--gold)]" />{SITE.email}</a>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold)]" />{SITE.address}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_PRIMARY.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-[color:var(--gold)]">{n.label}</Link></li>
            ))}
            <li><Link to="/vendor-registration" className="hover:text-[color:var(--gold)]">Vendor Registration</Link></li>
            <li><Link to="/blog" className="hover:text-[color:var(--gold)]">News & Insights</Link></li>
            <li><Link to="/faqs" className="hover:text-[color:var(--gold)]">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Services</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {SERVICE_LINKS.map((s) => (
              <li key={s.to}><Link to={s.to} className="hover:text-[color:var(--gold)]">{s.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white">Newsletter</h4>
          <p className="mt-4 text-sm text-white/70">Industry updates, tenders, and product news.</p>
          <div className="mt-4"><NewsletterForm /></div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved. RC: Registered in Nigeria.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-[color:var(--gold)]">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[color:var(--gold)]">Terms</Link>
            <Link to="/contact" className="hover:text-[color:var(--gold)]">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
