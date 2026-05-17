import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendJobApplicationEmails } from "@/lib/email.functions";

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  position_applied: z.string().trim().min(1).max(160),
  experience_years: z.string().optional(),
  cover_letter: z.string().trim().max(3000).optional().or(z.literal("")),
  resume_url: z.string().trim().max(500).optional().or(z.literal("")),
});

export function JobApplicationForm({ jobId, position }: { jobId?: string; position?: string }) {
  const [loading, setLoading] = useState(false);
  const sendEmails = useServerFn(sendJobApplicationEmails);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please complete the required fields."); return; }
    setLoading(true);
    const { data: inserted, error } = await supabase.from("job_applications").insert({
      job_id: jobId ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      position_applied: parsed.data.position_applied,
      experience_years: parsed.data.experience_years ? Number(parsed.data.experience_years) : null,
      cover_letter: parsed.data.cover_letter || null,
      resume_url: parsed.data.resume_url || null,
    }).select("id").single();
    setLoading(false);
    if (error || !inserted) { toast.error("Could not submit application."); return; }
    sendEmails({ data: { id: inserted.id } }).catch((err) => console.warn("email send failed", err));
    toast.success("Application received. A confirmation email is on its way.");
    form.reset();
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="full_name" label="Full name" required />
        <Field name="email" type="email" label="Email" required />
        <Field name="phone" label="Phone" />
        <Field name="experience_years" type="number" label="Years of experience" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Position applied for *</label>
        <input name="position_applied" required defaultValue={position} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <Field name="resume_url" label="Resume / CV URL (Google Drive, Dropbox, etc.)" />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Cover letter</label>
        <textarea name="cover_letter" rows={5} className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
      </div>
      <button disabled={loading} className="btn-gold disabled:opacity-60">
        {loading ? "Submitting…" : "Submit Application"}
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
