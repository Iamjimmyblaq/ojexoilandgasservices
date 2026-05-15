import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MessageSquare, Building2, Briefcase, ShoppingCart, Package } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin/")({ component: Dashboard });

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const counts = async (table: string, filter?: { col: string; val: string }) => {
        let q = supabase.from(table).select("*", { count: "exact", head: true });
        if (filter) q = q.eq(filter.col, filter.val);
        const { count } = await q;
        return count ?? 0;
      };
      return {
        quotes: await counts("quote_requests"),
        newQuotes: await counts("quote_requests", { col: "status", val: "new" }),
        contacts: await counts("contact_messages"),
        vendors: await counts("vendor_registrations"),
        applications: await counts("job_applications"),
        newApplications: await counts("job_applications", { col: "status", val: "new" }),
        procurement: await counts("procurement_requests"),
        products: await counts("products"),
      };
    },
  });

  const cards = [
    { label: "Quote Requests", value: data?.quotes, badge: data?.newQuotes ? `${data.newQuotes} new` : undefined, icon: FileText, to: "/admin/quotes" },
    { label: "Contact Messages", value: data?.contacts, icon: MessageSquare, to: "/admin/contacts" },
    { label: "Vendor Registrations", value: data?.vendors, icon: Building2, to: "/admin/vendors" },
    { label: "Job Applications", value: data?.applications, badge: data?.newApplications ? `${data.newApplications} new` : undefined, icon: Briefcase, to: "/admin/jobs" },
    { label: "Procurement Requests", value: data?.procurement, icon: ShoppingCart, to: "/admin/procurement" },
    { label: "Products", value: data?.products, icon: Package, to: "/admin/products" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-1 text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage inquiries, products, recruitment, and procurement.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to} className="card-elevated group rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between">
                <Icon className="h-6 w-6 text-[color:var(--gold-deep)]" />
                {c.badge && <span className="rounded-full bg-[color:var(--gold)]/20 px-2 py-0.5 text-[10px] font-medium text-[color:var(--navy-deep)]">{c.badge}</span>}
              </div>
              <p className="mt-4 text-3xl font-bold">{isLoading ? "—" : c.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
