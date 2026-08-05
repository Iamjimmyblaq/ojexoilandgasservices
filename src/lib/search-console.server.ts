/** Server-only Google Search Console helpers (gateway-backed connector). */

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

export type SiteEntry = { siteUrl: string; permissionLevel?: string };

function headers() {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const connectionApiKey = process.env["GOOGLE_SEARCH_CONSOLE_API_KEY"];
  if (!lovableApiKey || !connectionApiKey) {
    throw new Error("Search Console is not connected for this project.");
  }
  return {
    Authorization: `Bearer ${lovableApiKey}`,
    "X-Connection-Api-Key": connectionApiKey,
    "Content-Type": "application/json",
  };
}

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

export async function listVerifiedProperties(targetUrl: string): Promise<string[]> {
  const res = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers: headers() });
  if (!res.ok) throw new Error(`Could not list Search Console properties [${res.status}]: ${await res.text()}`);
  const { siteEntry = [] } = (await res.json()) as { siteEntry?: SiteEntry[] };
  const target = new URL(targetUrl);
  return siteEntry
    .filter((e) => e.permissionLevel !== "siteUnverifiedUser" && coversTarget(e.siteUrl, target))
    .map((e) => e.siteUrl);
}

export type UrlStatus = {
  url: string;
  label: string;
  verdict: string | null;
  coverageState: string | null;
  indexingState: string | null;
  robotsTxtState: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  lastCrawlTime: string | null;
  pageFetchState: string | null;
  sitemaps: string[];
  error: string | null;
};

export async function inspectUrl(siteUrl: string, url: string, label: string): Promise<UrlStatus> {
  const base: UrlStatus = {
    url,
    label,
    verdict: null,
    coverageState: null,
    indexingState: null,
    robotsTxtState: null,
    googleCanonical: null,
    userCanonical: null,
    lastCrawlTime: null,
    pageFetchState: null,
    sitemaps: [],
    error: null,
  };
  try {
    const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ inspectionUrl: url, siteUrl }),
    });
    if (!res.ok) return { ...base, error: `Search Console returned ${res.status}: ${(await res.text()).slice(0, 300)}` };
    const json = (await res.json()) as {
      inspectionResult?: { indexStatusResult?: Record<string, unknown> };
    };
    const r = json.inspectionResult?.indexStatusResult ?? {};
    const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : null);
    return {
      ...base,
      verdict: str("verdict"),
      coverageState: str("coverageState"),
      indexingState: str("indexingState"),
      robotsTxtState: str("robotsTxtState"),
      googleCanonical: str("googleCanonical"),
      userCanonical: str("userCanonical"),
      lastCrawlTime: str("lastCrawlTime"),
      pageFetchState: str("pageFetchState"),
      sitemaps: Array.isArray(r["sitemap"]) ? (r["sitemap"] as string[]) : [],
    };
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : "Inspection failed" };
  }
}

export async function getSitemapStatus(siteUrl: string, sitemapUrl: string) {
  try {
    const res = await fetch(
      `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
      { headers: headers() },
    );
    if (!res.ok) return { sitemapUrl, error: `Search Console returned ${res.status}`, lastDownloaded: null, lastSubmitted: null, errors: null, warnings: null, isPending: null };
    const j = (await res.json()) as Record<string, unknown>;
    return {
      sitemapUrl,
      error: null,
      lastDownloaded: (j["lastDownloaded"] as string) ?? null,
      lastSubmitted: (j["lastSubmitted"] as string) ?? null,
      errors: (j["errors"] as string) ?? null,
      warnings: (j["warnings"] as string) ?? null,
      isPending: (j["isPending"] as boolean) ?? null,
    };
  } catch (err) {
    return { sitemapUrl, error: err instanceof Error ? err.message : "Sitemap lookup failed", lastDownloaded: null, lastSubmitted: null, errors: null, warnings: null, isPending: null };
  }
}
