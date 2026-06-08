import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendVendorEmails } from "@/lib/email.functions";

const schema = z.object({
  company_name: z.string().trim().min(1).max(160),
  contact_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  website: z.string().trim().max(255).refine((u) => u === "" || /^https?:\/\//i.test(u), { message: "Only http(s) URLs allowed" }).optional().or(z.literal("")),
  category: z.string().trim().min(2).max(160),
  capabilities: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function generateVendorReference(now: Date = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  const cryptoObj = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint32Array(6);
    cryptoObj.getRandomValues(buf);
    for (let i = 0; i < 6; i++) rand += alphabet[buf[i] % alphabet.length];
  } else {
    for (let i = 0; i < 6; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `VEN-${yy}${mm}${dd}-${rand}`;
}

export function VendorForm() {
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const sendEmails = useServerFn(sendVendorEmails);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please complete the required fields."); return; }
    setLoading(true);
    const ref = generateVendorReference();
    const payload = {
      ...parsed.data,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
      website: parsed.data.website || null,
      capabilities: parsed.data.capabilities || null,
    };
    const { error } = await supabase.from("vendor_registrations").insert(payload);
    setLoading(false);
    if (error) { toast.error("Could not submit registration."); return; }
    setReference(ref);
    sendEmails({ data: { ...payload, id: null, reference: ref } })
      .catch((err) => console.warn("vendor email send failed", err));
    toast.success(`Registered. Your reference is ${ref}.`);
    form.reset();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {reference && (
        <div className="rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--gold)]">Your reference</div>
          <div className="font-mono text-lg font-bold">{reference}</div>
          <p className="mt-1 text-xs text-muted-foreground">Keep this number for follow-up. A confirmation email is on its way.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="company_name" label="Company name" required />
        <Field name="contact_name" label="Contact person" required />
        <Field name="email" type="email" label="Business email" required />
        <Field name="phone" label="Phone" />
        <Field name="country" label="Country" />
        <Field name="website" label="Website" />
      </div>
      <Field name="category" label="Supply category (e.g. Drilling Equipment, PPE, Chemicals)" required />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Capabilities & products</label>
        <textarea name="capabilities" rows={4} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <button disabled={loading} className="btn-gold disabled:opacity-60">
        {loading ? "Submitting…" : "Register as Vendor"}
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
