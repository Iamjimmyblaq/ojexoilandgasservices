export const CONSENT_KEY = "ojex-cookie-consent";
export const ADSENSE_CLIENT = "ca-pub-4622173803115510";

export type ConsentValue = "accepted" | "rejected";

const listeners = new Set<(v: ConsentValue | null) => void>();

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l(value));
  if (value === "accepted") loadAdSense();
}

export function onConsentChange(cb: (v: ConsentValue | null) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let adsenseRequested = false;

/** Injects the AdSense script once, deferred to idle time to protect Core Web Vitals. */
export function loadAdSense() {
  if (typeof window === "undefined" || adsenseRequested) return;
  if (getConsent() !== "accepted") return;
  adsenseRequested = true;

  const inject = () => {
    if (document.querySelector('script[data-adsense="1"]')) return;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.dataset.adsense = "1";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(s);
  };

  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void })
    .requestIdleCallback;
  if (idle) idle(inject, { timeout: 4000 });
  else window.setTimeout(inject, 2000);
}
