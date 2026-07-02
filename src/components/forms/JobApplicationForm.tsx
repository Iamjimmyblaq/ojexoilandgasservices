import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendJobApplicationEmails, createJobApplication, attachResumeToApplication } from "@/lib/email.functions";
import { CheckCircle2, FileText, Link as LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const schema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  position_applied: z.string().trim().min(1).max(160),
  experience_years: z.string().optional(),
  cover_letter: z.string().trim().max(3000).optional().or(z.literal("")),
});

const MAX_RESUME_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function generateReference() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JOB-${yy}${mm}${dd}-${rand}`;
}

export function JobApplicationForm({ jobId, position }: { jobId?: string; position?: string }) {
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<null | { name: string; reference: string; email: string; position: string }>(null);
  const sendEmails = useServerFn(sendJobApplicationEmails);
  const createApp = useServerFn(createJobApplication);
  const attachResume = useServerFn(attachResumeToApplication);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error("Please complete the required fields."); return; }
    if (!resumeFile) { toast.error("Please attach your resume (PDF or Word)."); return; }
    if (resumeFile.size > MAX_RESUME_BYTES) { toast.error("Resume must be smaller than 8MB."); return; }
    if (!ALLOWED_RESUME_TYPES.includes(resumeFile.type)) { toast.error("Resume must be PDF, DOC, or DOCX."); return; }

    setLoading(true);
    const reference = generateReference();

    // Upload resume to private bucket
    const ext = resumeFile.name.split(".").pop()?.toLowerCase() || "pdf";
    const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${reference}/${Date.now()}_${safeName}`;
    const up = await supabase.storage.from("resumes").upload(path, resumeFile, {
      contentType: resumeFile.type,
      upsert: false,
    });
    if (up.error) {
      setLoading(false);
      console.error("resume upload failed", up.error);
      toast.error("Could not upload resume. Try again.");
      return;
    }

    void ext;
    const payload = {
      job_id: jobId ?? null,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      position_applied: parsed.data.position_applied,
      experience_years: parsed.data.experience_years ? Number(parsed.data.experience_years) : null,
      cover_letter: parsed.data.cover_letter || null,
      resume_url: path, // storage object path, NOT a public URL
      reference,
    };

    const { error } = await supabase.from("job_applications").insert({
      job_id: payload.job_id,
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
      position_applied: payload.position_applied,
      experience_years: payload.experience_years,
      cover_letter: payload.cover_letter,
      resume_url: payload.resume_url,
      reference: payload.reference,
    });
    setLoading(false);
    if (error) {
      console.error("application insert failed", error);
      toast.error(error.message || "Could not submit application.");
      return;
    }

    sendEmails({
      data: {
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        position_applied: payload.position_applied,
        experience_years: payload.experience_years,
        cover_letter: payload.cover_letter,
        resume_url: null, // do not email storage paths
        reference,
        id: null,
      },
    }).catch((err) => console.warn("email send failed", err));

    setSuccess({
      name: parsed.data.full_name,
      reference,
      email: parsed.data.email,
      position: parsed.data.position_applied,
    });
    form.reset();
    setResumeFile(null);
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--gold)]/15">
          <CheckCircle2 className="h-9 w-9 text-[color:var(--gold-deep)]" />
        </div>
        <h3 className="mt-5 text-2xl font-bold">Application received, {success.name}!</h3>
        <div className="mx-auto mt-4 inline-block rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference number</div>
          <div className="font-mono text-lg font-bold text-foreground">{success.reference}</div>
        </div>
        <p className="mt-4 text-muted-foreground">
          Your application for <strong className="text-foreground">{success.position}</strong> has been received. Save your reference number to track its status.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          A confirmation email has been sent to <strong className="text-foreground">{success.email}</strong>.
        </p>
        <Link
          to="/application-status"
          search={{ ref: success.reference, email: success.email }}
          className="btn-gold mt-6 inline-flex items-center gap-2"
        >
          <LinkIcon className="h-4 w-4" /> Track my application
        </Link>
      </div>
    );
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
      <div>
        <label className="mb-1.5 block text-sm font-medium">Resume / CV (PDF, DOC, DOCX — max 8MB) *</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-[color:var(--navy-deep)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
          />
        </div>
        {resumeFile && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" /> {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
          </p>
        )}
      </div>
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
