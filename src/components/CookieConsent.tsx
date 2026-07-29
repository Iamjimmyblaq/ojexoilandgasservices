import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getConsent, loadAdSense, setConsent } from "@/lib/consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (existing === "accepted") loadAdSense();
    if (!existing) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (v: "accepted" | "rejected") => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90"
    >
      <div className="container-x grid gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <p className="min-w-0 text-sm text-muted-foreground">
          We use essential cookies to run this site and, with your permission, advertising cookies to
          show relevant ads. See our{" "}
          <Link to="/privacy" className="text-[color:var(--gold)] underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-3">
          <button onClick={() => choose("rejected")} className="btn-navy px-5 py-2 text-sm">
            Essential only
          </button>
          <button onClick={() => choose("accepted")} className="btn-gold px-5 py-2 text-sm">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
