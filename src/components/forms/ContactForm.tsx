import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendContactEmails } from "@/lib/email.functions";

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
  const sendEmails = useServerFn(sendContactEmails);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please review the form fields."); return; }
    setLoading(true);
    const { data: inserted, error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    }).select("id").single();
    setLoading(false);
    if (error || !inserted) { toast.error("Could not send message. Try again."); return; }
    sendEmails({ data: { id: inserted.id } }).catch((err) => console.warn("email send failed", err));
    toast.success("Message sent. A confirmation email is on its way.");
    form.reset();
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
