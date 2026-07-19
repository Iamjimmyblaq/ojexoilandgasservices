import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteLayout } from "@/components/SiteLayout";
import { SITE } from "@/lib/site";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Page not found</h1>
          <p className="mt-3 text-muted-foreground">The page you're looking for has moved or doesn't exist.</p>
          <Link to="/" className="btn-gold mt-6">Return Home</Link>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <SiteLayout>
      <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
        <div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">{error.message}</p>
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-navy mt-6">Try again</button>
        </div>
      </div>
    </SiteLayout>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { name: "author", content: SITE.name },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0a1628" },
      { title: "OJEX — Industrial Sourcing & Oilfield Manpower" },
      { property: "og:title", content: "OJEX — Industrial Sourcing & Oilfield Manpower" },
      { name: "twitter:title", content: "OJEX — Industrial Sourcing & Oilfield Manpower" },
      { name: "description", content: "OJEX Oil and Gas Services delivers end-to-end procurement, chemical supply, equipment supply, base oil distribution, logistics, and oilfield manpower Management" },
      { property: "og:description", content: "OJEX Oil and Gas Services delivers end-to-end procurement, chemical supply, equipment supply, base oil distribution, logistics, and oilfield manpower Management" },
      { name: "twitter:description", content: "OJEX Oil and Gas Services delivers end-to-end procurement, chemical supply, equipment supply, base oil distribution, logistics, and oilfield manpower Management" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c2c106a6-f1ab-4322-a57d-978d7e1ef220" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c2c106a6-f1ab-4322-a57d-978d7e1ef220" },
      { name: "google-site-verification", content: "xGt1fcyHfQ6a3VIEy72RWBnsh0ICY_dui7Ql8vajSkY" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "icon", type: "image/png", href: "/ojex-logo.png" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: SITE.name,
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        url: "https://ojexoilandgasservices.lovable.app",
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address,
          addressLocality: "Port Harcourt",
          addressRegion: "Rivers State",
          addressCountry: "NG",
        },
        sameAs: [SITE.whatsapp],
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout><Outlet /></SiteLayout>
    </QueryClientProvider>
  );
}
