import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  company_name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  product_service: z.string().trim().min(2).max(300),
  quantity: z.string().trim().max(80).optional().or(z.literal("")),
  delivery_location: z.string().trim().max(200).optional().or(z.literal("")),
  timeline: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function QuoteForm({ defaultProduct }: { defaultProduct?: string }) {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please complete the required fields."); return; }
    setLoading(true);
    const { error } = await supabase.from("quote_requests").insert({
      ...parsed.data,
      phone: parsed.data.phone || null,
      quantity: parsed.data.quantity || null,
      delivery_location: parsed.data.delivery_location || null,
      timeline: parsed.data.timeline || null,
      budget: parsed.data.budget || null,
      notes: parsed.data.notes || null,
    });
    setLoading(false);
    if (error) { toast.error("Could not submit. Try again."); return; }
    toast.success("Quote request received. Our team will respond within 24 hours.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="company_name" label="Company name" required />
        <Field name="contact_name" label="Contact name" required />
        <Field name="email" type="email" label="Business email" required />
        <Field name="phone" label="Phone" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Product / service required *</label>
        <input name="product_service" required defaultValue={defaultProduct} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="quantity" label="Quantity" />
        <Field name="delivery_location" label="Delivery location" />
        <Field name="timeline" label="Timeline" />
        <Field name="budget" label="Budget (optional)" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Additional notes</label>
        <textarea name="notes" rows={4} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <button disabled={loading} className="btn-gold disabled:opacity-60">
        {loading ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}{required && " *"}</label>
      <input name={name} type={type} required={required} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
    </div>
  );
}
