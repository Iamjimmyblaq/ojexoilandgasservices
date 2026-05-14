import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please review the form fields."); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) { toast.error("Could not send message. Try again."); return; }
    toast.success("Message sent. We will respond within 1 business day.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Phone" />
        <Field name="company" label="Company" />
      </div>
      <Field name="subject" label="Subject" />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Message *</label>
        <textarea name="message" required rows={5} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <button disabled={loading} className="btn-navy w-full sm:w-auto disabled:opacity-60">
        {loading ? "Sending…" : "Send Message"}
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
