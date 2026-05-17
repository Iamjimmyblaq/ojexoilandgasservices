import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV_PRIMARY, SITE } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/ojex-logo.png";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[color:var(--navy-deep)]/95 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--navy-deep)]/85">
      <div className="container-x flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="OJEX Oil and Gas Services" className="h-12 w-auto sm:h-14" />
          <span className="sr-only">OJEX Oil and Gas Services</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_PRIMARY.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm font-medium text-white/80 transition-colors hover:text-[color:var(--gold)]"
              activeProps={{ className: "text-[color:var(--gold)]" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={SITE.phoneHref} className="flex items-center gap-2 text-sm text-white/80 hover:text-[color:var(--gold)]">
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/procurement"} className="text-sm font-medium text-white/80 hover:text-[color:var(--gold)]">
                {isAdmin ? "Admin" : "Portal"}
              </Link>
              <button onClick={() => signOut()} className="text-sm font-medium text-white/80 hover:text-[color:var(--gold)]">Sign out</button>
            </>
          ) : (
            <Link to="/auth" className="text-sm font-medium text-white/80 hover:text-[color:var(--gold)]">Sign in</Link>
          )}
          <Link to="/quote" className="btn-gold !py-2.5 !text-xs">Request Quote</Link>
        </div>

        <button onClick={() => setOpen(!open)} className="text-white lg:hidden" aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[color:var(--navy-deep)] lg:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {NAV_PRIMARY.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-[color:var(--gold)]">
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/procurement"} onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm text-white/80">
                  {isAdmin ? "Admin Dashboard" : "My Portal"}
                </Link>
                <button onClick={() => { setOpen(false); signOut(); }} className="rounded px-2 py-2 text-left text-sm text-white/80">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded px-2 py-2 text-sm text-white/80">Sign in</Link>
            )}
            <Link to="/quote" onClick={() => setOpen(false)} className="btn-gold mt-3 w-full">Request Quote</Link>
          </div>
        </div>
      )}
    </header>
  );
}
