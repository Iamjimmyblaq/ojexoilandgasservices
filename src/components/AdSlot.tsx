import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, getConsent, onConsentChange } from "@/lib/consent";

type Format = "auto" | "horizontal" | "rectangle" | "vertical";

interface AdSlotProps {
  /** AdSense ad unit slot id */
  slot: string;
  format?: Format;
  /** Tailwind height classes reserving space so ads never cause layout shift */
  className?: string;
  label?: string;
}

/**
 * Responsive AdSense container. Reserves its own space (no CLS), renders nothing
 * until the visitor consents, and only requests a fill when scrolled near view.
 */
export function AdSlot({ slot, format = "auto", className = "", label = "Advertisement" }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [consented, setConsented] = useState(false);
  const [inView, setInView] = useState(false);
  const pushed = useRef(false);

  useEffect(() => {
    setConsented(getConsent() === "accepted");
    return onConsentChange((v) => setConsented(v === "accepted"));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!consented || !inView || pushed.current) return;
    pushed.current = true;
    const w = window as unknown as { adsbygoogle?: unknown[] };
    try {
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      /* script not ready yet */
    }
  }, [consented, inView]);

  return (
    <div
      ref={ref}
      className={`mx-auto w-full min-w-0 overflow-hidden ${
        className || "min-h-[100px] sm:min-h-[120px] lg:min-h-[100px]"
      }`}
    >
      {consented ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
          aria-label={label}
        />
      ) : null}
    </div>
  );
}
