import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Package, FileText, MessageSquare, Building2, Briefcase, ShoppingCart, BarChart3, LogOut, ChevronLeft, Users, Newspaper } from "lucide-react";
import logo from "@/assets/ojex-logo.png";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — OJEX" }, { name: "robots", content: "noindex" }] }),
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/blog", label: "Blog & Newsletter", icon: Newspaper, exact: false },
  { to: "/admin/quotes", label: "Quote Requests", icon: FileText, exact: false },
  { to: "/admin/contacts", label: "Contact Messages", icon: MessageSquare, exact: false },
  { to: "/admin/vendors", label: "Vendors", icon: Building2, exact: false },
  { to: "/admin/jobs", label: "Jobs & Applications", icon: Briefcase, exact: false },
  { to: "/admin/procurement", label: "Procurement", icon: ShoppingCart, exact: false },
  { to: "/admin/users", label: "Users & Roles", icon: Users, exact: false },
  { to: "/admin/reports", label: "Reports & Exports", icon: BarChart3, exact: false },
] as const;

function AdminLayout() {
  const { user, isAdmin, isManager, loading, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    // Non-admin users are silently redirected to the public site
    if (!isAdmin && !isManager) { nav({ to: "/" }); }
  }, [loading, user, isAdmin, isManager, nav]);

  if (loading || !user || (!isAdmin && !isManager)) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-[color:var(--navy-deep)] text-white lg:flex">
        <div className="flex h-20 items-center gap-2 border-b border-white/10 px-4">
          <img src={logo} alt="OJEX" className="h-12 w-auto" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-[color:var(--gold)] text-[color:var(--navy-deep)] font-medium" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <p className="truncate px-2 pb-2 text-xs text-white/80">{user.email}</p>
          <Link to="/" className="flex items-center gap-2 rounded px-3 py-2 text-xs text-white/70 hover:bg-white/5"><ChevronLeft className="h-3 w-3" /> View website</Link>
          <button onClick={() => signOut()} className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-white/70 hover:bg-white/5">
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto">
        <div className="border-b border-border bg-background px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <img src={logo} alt="OJEX" className="h-10" />
            <button onClick={() => signOut()} className="text-sm text-muted-foreground">Sign out</button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs">{item.label}</Link>
            ))}
          </div>
        </div>
        <div className="p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
