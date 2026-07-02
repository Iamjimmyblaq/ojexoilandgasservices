import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ADMIN_EMAIL = "ojexoilandgasservices@gmail.com";

async function logEmail(entry: {
  kind: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  error?: string | null;
  related_id?: string | null;
  related_reference?: string | null;
}) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("email_log").insert(entry);
  } catch (e) {
    console.warn("email_log insert failed", e);
  }
}

function esc(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHeader(s: string): string {
  return String(s ?? "").replace(/[\r\n\t]+/g, " ").trim();
}

// Normalize problem characters in subjects so they read cleanly in all mail clients.
function sanitizeSubject(s: string): string {
  let out = String(s ?? "")
    // Normalize Unicode so accented chars combine into single codepoints
    .normalize("NFC")
    // Smart quotes -> straight quotes
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    // Dashes -> hyphen
    .replace(/[\u2013\u2014\u2015\u2212]/g, "-")
    // Ellipsis -> three dots
    .replace(/\u2026/g, "...")
    // Non-breaking / zero-width / BOM
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Strip emoji and pictographs (incl. variation selectors and ZWJ sequences)
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    // Drop any remaining control chars
    .replace(/[\x00-\x1F\x7F]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
  return sanitizeHeader(out);
}

function encodeHeaderValue(s: string): string {
  const clean = sanitizeSubject(s);
  // ASCII-only -> send as-is. Otherwise RFC 2047 encoded-word (UTF-8, Base64).
  if (/^[\x20-\x7E]*$/.test(clean)) return clean;
  const b64 = btoa(unescape(encodeURIComponent(clean)));
  return `=?UTF-8?B?${b64}?=`;
}


function rfc2822(to: string, subject: string, html: string, from: string) {
  const safeTo = sanitizeHeader(to);
  const safeFrom = sanitizeHeader(from);
  const boundary = "----=_OJEX_" + Math.random().toString(36).slice(2);
  const msg = [
    `From: =?UTF-8?B?${btoa(unescape(encodeURIComponent("OJEX Oil and Gas Services")))}?= <${safeFrom}>`,
    `To: ${safeTo}`,
    `Subject: ${encodeHeaderValue(subject)}`,

    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    html.replace(/<[^>]+>/g, ""),
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
  return btoa(unescape(encodeURIComponent(msg))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sendOne(to: string, subject: string, html: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
  if (!lovableKey || !gmailKey) throw new Error("Email credentials missing");

  const raw = rfc2822(to, subject, html, ADMIN_EMAIL);
  const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gmail send failed [${res.status}]: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function shell(title: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#fff">
    <div style="background:#0a1f44;color:#fff;padding:18px 20px;text-align:center">
      <h1 style="margin:0;font-size:20px;color:#d4af37">OJEX Oil and Gas Services</h1>
    </div>
    <div style="background:#d4af37;color:#0a1f44;padding:10px 20px;font-size:14px;font-weight:600">${esc(title)}</div>
    <div style="padding:22px;border:1px solid #e5e7eb;border-top:none">${body}</div>
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:12px 0">No 18 Okporo Road, Port Harcourt, Rivers State · +234 707 572 8373</p>
  </div>`;
}

function row(label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9">${esc(label)}</td><td style="padding:6px 12px;font-size:14px;border-bottom:1px solid #f1f5f9">${esc(value)}</td></tr>`;
}

async function dispatch(
  customer: { email: string; subject: string; html: string },
  admin: { subject: string; html: string },
  log?: { kind: string; related_id?: string | null; related_reference?: string | null },
) {
  const results = await Promise.allSettled([
    sendOne(customer.email, customer.subject, customer.html),
    sendOne(ADMIN_EMAIL, admin.subject, admin.html),
  ]);
  const errors = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown");
  if (log) {
    const [custRes, admRes] = results;
    await Promise.all([
      logEmail({
        kind: log.kind,
        recipient: customer.email,
        subject: customer.subject,
        status: custRes.status === "fulfilled" ? "sent" : "failed",
        error: custRes.status === "rejected" ? String((custRes as PromiseRejectedResult).reason?.message ?? "") : null,
        related_id: log.related_id ?? null,
        related_reference: log.related_reference ?? null,
      }),
      logEmail({
        kind: `${log.kind}-admin`,
        recipient: ADMIN_EMAIL,
        subject: admin.subject,
        status: admRes.status === "fulfilled" ? "sent" : "failed",
        error: admRes.status === "rejected" ? String((admRes as PromiseRejectedResult).reason?.message ?? "") : null,
        related_id: log.related_id ?? null,
        related_reference: log.related_reference ?? null,
      }),
    ]);
  }
  return { ok: errors.length === 0, errors };
}


// ====================== QUOTES ======================
const quoteSchema = z.object({
  company_name: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  product_service: z.string().min(1).max(500),
  quantity: z.string().max(120).nullable().optional(),
  delivery_location: z.string().max(300).nullable().optional(),
  timeline: z.string().max(120).nullable().optional(),
  budget: z.string().max(120).nullable().optional(),
  notes: z.string().max(3000).nullable().optional(),
  reference: z.string().max(60).nullable().optional(),
  id: z.string().uuid().nullable().optional(),
});

export const sendQuoteEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const ref = data.reference || "";
    const refBlock = ref
      ? `<div style="margin:14px 0;padding:12px 16px;background:#fef3c7;border-left:4px solid #d4af37;border-radius:4px"><div style="font-size:12px;color:#78350f;letter-spacing:.5px">REFERENCE NUMBER</div><div style="font-size:18px;font-weight:700;color:#0a1f44;font-family:monospace">${esc(ref)}</div></div>`
      : "";

    const customerHtml = shell("Quote request received", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(data.contact_name)}!</h2>
      ${refBlock}
      <p style="color:#475569;line-height:1.6">We have received your quote request for <strong>${esc(data.product_service)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Please keep this reference number for your records. Our team will respond within <strong>24 hours</strong> with pricing, lead time, and terms.</p>
      <p style="color:#475569;line-height:1.6">For urgent matters, WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>`);

    const adminHtml = shell(`🔔 New Quote Request${ref ? ` — ${ref}` : ""}`, `
      <table style="width:100%;border-collapse:collapse">
        ${row("Reference", ref)}${row("Company", data.company_name)}${row("Contact", data.contact_name)}${row("Email", data.email)}
        ${row("Phone", data.phone)}${row("Product/Service", data.product_service)}${row("Quantity", data.quantity)}
        ${row("Delivery Location", data.delivery_location)}${row("Timeline", data.timeline)}${row("Budget", data.budget)}${row("Notes", data.notes)}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/quotes</p>`);

    return dispatch(
      { email: data.email, subject: `Quote request ${ref || ""} received — OJEX`.trim(), html: customerHtml },
      { subject: `New quote ${ref}: ${data.company_name} — ${data.product_service}`.slice(0, 180), html: adminHtml },
      { kind: "quote", related_id: data.id ?? null, related_reference: ref || null },
    );
  });

// ====================== CONTACT ======================
const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  company: z.string().max(200).nullable().optional(),
  subject: z.string().max(200).nullable().optional(),
  message: z.string().min(1).max(5000),
  id: z.string().uuid().nullable().optional(),
});

export const sendContactEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = shell("Message received", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(data.name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your message and will respond within <strong>1 business day</strong>.</p>
      <p style="color:#475569;line-height:1.6">If urgent, WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>`);

    const adminHtml = shell("📨 New Contact Message", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", data.name)}${row("Email", data.email)}${row("Phone", data.phone)}${row("Company", data.company)}${row("Subject", data.subject)}
      </table>
      <div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(data.message)}</div>`);

    return dispatch(
      { email: data.email, subject: "We received your message — OJEX", html: customerHtml },
      { subject: `Contact: ${data.subject || data.name}`.slice(0, 180), html: adminHtml },
      { kind: "contact", related_id: data.id ?? null },
    );
  });

// ====================== JOB APPLICATIONS ======================
const jobAppSchema = z.object({
  full_name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  position_applied: z.string().min(1).max(200),
  experience_years: z.number().nullable().optional(),
  cover_letter: z.string().max(5000).nullable().optional(),
  resume_url: z.string().max(500).nullable().optional(),
  reference: z.string().max(60).nullable().optional(),
  id: z.string().uuid().nullable().optional(),
});


export const sendJobApplicationEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => jobAppSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = shell("Application received", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(data.full_name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your application for the position of <strong>${esc(data.position_applied)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Our recruitment team reviews every application carefully and will contact shortlisted candidates within <strong>5–10 business days</strong>.</p>`);

    const adminHtml = shell(`👤 New Job Application — ${data.position_applied}`, `
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", data.full_name)}${row("Email", data.email)}${row("Phone", data.phone)}
        ${row("Position", data.position_applied)}${row("Experience (yrs)", data.experience_years)}${row("Resume URL", data.resume_url)}
      </table>
      ${data.cover_letter ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(data.cover_letter)}</div>` : ""}
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/jobs</p>`);

    return dispatch(
      { email: data.email, subject: `Application received: ${data.position_applied} — OJEX`.slice(0, 180), html: customerHtml },
      { subject: `Application: ${data.full_name} — ${data.position_applied}`.slice(0, 180), html: adminHtml },
      { kind: "job-application", related_id: data.id ?? null },
    );
  });

// Create the job_applications row using admin (bypasses ordering issues with resume upload RLS)
const createJobApplicationSchema = z.object({
  job_id: z.string().uuid().nullable().optional(),
  full_name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  position_applied: z.string().min(1).max(200),
  experience_years: z.number().nullable().optional(),
  cover_letter: z.string().max(5000).nullable().optional(),
  reference: z.string().min(4).max(60),
});

export const createJobApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createJobApplicationSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("job_applications").insert({
      job_id: data.job_id ?? null,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      position_applied: data.position_applied,
      experience_years: data.experience_years ?? null,
      cover_letter: data.cover_letter ?? null,
      resume_url: null,
      reference: data.reference,
      status: "new",
    });
    if (error) throw new Error(error.message);
    return { ok: true, reference: data.reference };
  });

// Attach resume storage path after upload (admin bypass since anon has no UPDATE)
const attachResumeSchema = z.object({
  reference: z.string().min(4).max(60),
  path: z.string().min(1).max(500),
});

export const attachResumeToApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => attachResumeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("job_applications")
      .update({ resume_url: data.path })
      .eq("reference", data.reference);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ====================== VENDOR REGISTRATION ======================
const vendorSchema = z.object({
  company_name: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().max(40).nullable().optional(),
  country: z.string().max(120).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  category: z.string().min(1).max(200),
  capabilities: z.string().max(3000).nullable().optional(),
  reference: z.string().max(60).nullable().optional(),
  id: z.string().uuid().nullable().optional(),
});

export const sendVendorEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => vendorSchema.parse(input))
  .handler(async ({ data }) => {
    const ref = data.reference || "";
    const refBlock = ref
      ? `<div style="margin:14px 0;padding:12px 16px;background:#fef3c7;border-left:4px solid #d4af37;border-radius:4px"><div style="font-size:12px;color:#78350f;letter-spacing:.5px">REFERENCE NUMBER</div><div style="font-size:18px;font-weight:700;color:#0a1f44;font-family:monospace">${esc(ref)}</div></div>`
      : "";

    const customerHtml = shell("Vendor registration received", `
      <h2 style="color:#0a1f44;margin-top:0">Welcome, ${esc(data.contact_name)}!</h2>
      ${refBlock}
      <p style="color:#475569;line-height:1.6">Thank you for registering <strong>${esc(data.company_name)}</strong> as a vendor with OJEX Oil and Gas Services under the <strong>${esc(data.category)}</strong> category.</p>
      <h3 style="color:#0a1f44;margin:18px 0 8px;font-size:15px">What happens next</h3>
      <ol style="color:#475569;line-height:1.7;padding-left:20px;margin:0">
        <li>Our procurement team reviews your submission within <strong>5–7 business days</strong>.</li>
        <li>We may reach out for supporting documents (company profile, certifications, references).</li>
        <li>Approved vendors are added to our pre-qualified supplier pool and notified by email.</li>
      </ol>
      <p style="color:#475569;line-height:1.6;margin-top:16px">Please quote your reference number <strong style="font-family:monospace">${esc(ref)}</strong> in any future correspondence. For urgent matters, WhatsApp <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a>.</p>`);

    const safeWebsite = data.website && /^https?:\/\//i.test(data.website) ? data.website : "";
    const adminHtml = shell(`🏭 New Vendor Registration${ref ? ` — ${ref}` : ""}`, `
      <table style="width:100%;border-collapse:collapse">
        ${row("Reference", ref)}${row("Company", data.company_name)}${row("Contact", data.contact_name)}${row("Email", data.email)}
        ${row("Phone", data.phone)}${row("Country", data.country)}${row("Website", safeWebsite)}${row("Category", data.category)}
      </table>
      ${data.capabilities ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(data.capabilities)}</div>` : ""}
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/vendors</p>`);

    return dispatch(
      { email: data.email, subject: `Vendor registration ${ref || ""} received — OJEX`.trim(), html: customerHtml },
      { subject: `Vendor ${ref}: ${data.company_name} — ${data.category}`.slice(0, 180), html: adminHtml },
      { kind: "vendor", related_id: data.id ?? null, related_reference: ref || null },
    );
  });


// ====================== NEWSLETTER ======================
const newsletterSchema = z.object({
  email: z.string().email().max(255),
});

export const sendNewsletterWelcome = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = shell("Welcome to the OJEX newsletter", `
      <h2 style="color:#0a1f44;margin-top:0">You're in!</h2>
      <p style="color:#475569;line-height:1.6">Thanks for subscribing to OJEX Oil and Gas Services updates. You'll receive industry insights, product launches, and tender opportunities straight to your inbox.</p>
      <p style="color:#475569;line-height:1.6">Need anything sooner? Reach us at <a href="mailto:${ADMIN_EMAIL}" style="color:#d4af37">${ADMIN_EMAIL}</a>.</p>`);

    const adminHtml = shell("✉️ New Newsletter Subscriber", `
      <table style="width:100%;border-collapse:collapse">${row("Email", data.email)}</table>`);

    return dispatch(
      { email: data.email, subject: "Welcome to OJEX updates", html: customerHtml },
      { subject: `Newsletter subscriber: ${data.email}`.slice(0, 180), html: adminHtml },
      { kind: "newsletter" },
    );
  });


// ====================== JOB APPLICATION STATUS CHANGES ======================
const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "reviewing", "shortlisted", "rejected", "hired"]),
});

const STATUS_COPY: Record<string, { subject: (pos: string) => string; heading: string; body: string; color: string }> = {
  reviewing: {
    subject: (p) => `Your application for ${p} is under review — OJEX`,
    heading: "Your application is being reviewed",
    body: "Good news — our recruitment team has begun reviewing your application. We'll let you know as soon as there's an update. This typically takes 5–10 business days.",
    color: "#0a1f44",
  },
  shortlisted: {
    subject: (p) => `🎉 You've been shortlisted for ${p} — OJEX`,
    heading: "Congratulations — you've been shortlisted!",
    body: "We're impressed with your background. Our hiring manager will be in touch shortly with next steps, which may include an interview or assessment. Please keep an eye on your inbox (and spam folder).",
    color: "#d4af37",
  },
  rejected: {
    subject: (p) => `Update on your application for ${p} — OJEX`,
    heading: "Update on your application",
    body: "Thank you for your interest in joining OJEX Oil and Gas Services. After careful review, we have decided to move forward with other candidates whose experience more closely matches the current requirements. We genuinely appreciate the time you invested in applying and encourage you to apply for future openings that match your profile.",
    color: "#64748b",
  },
  hired: {
    subject: (p) => `🎊 Welcome to OJEX — Offer for ${p}`,
    heading: "Welcome aboard!",
    body: "We're delighted to extend you an offer for this role. Our HR team will reach out directly to share your offer details, paperwork, and onboarding schedule. Welcome to the OJEX family!",
    color: "#0d7a3f",
  },
  new: {
    subject: (p) => `Application received: ${p} — OJEX`,
    heading: "Application received",
    body: "We have received your application and it is now in our queue. You'll hear from us soon.",
    color: "#0a1f44",
  },
};

export const sendJobStatusEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: app, error } = await supabaseAdmin
      .from("job_applications")
      .select("id, full_name, email, position_applied, reference, status")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !app) throw new Error("Application not found");

    const copy = STATUS_COPY[data.status] ?? STATUS_COPY.new;
    const refBlock = app.reference
      ? `<div style="margin:14px 0;padding:10px 14px;background:#f8fafc;border-left:4px solid ${copy.color};border-radius:4px"><div style="font-size:11px;color:#64748b;letter-spacing:.5px">REFERENCE</div><div style="font-size:15px;font-weight:700;color:#0a1f44;font-family:monospace">${esc(app.reference)}</div></div>`
      : "";

    const html = shell(copy.heading, `
      <h2 style="color:${copy.color};margin-top:0">${esc(copy.heading)}, ${esc(app.full_name)}</h2>
      ${refBlock}
      <p style="color:#475569;line-height:1.7">${esc(copy.body)}</p>
      <p style="color:#475569;line-height:1.7;margin-top:18px">Position: <strong>${esc(app.position_applied)}</strong></p>
      <p style="color:#475569;line-height:1.6;margin-top:18px;font-size:13px">You can check your status anytime using your reference number at our careers page.</p>
      <p style="color:#475569;line-height:1.6;margin-top:18px;font-size:13px">Questions? Reply to this email or contact <a href="mailto:${ADMIN_EMAIL}" style="color:#d4af37">${ADMIN_EMAIL}</a>.</p>`);

    const result = await Promise.allSettled([sendOne(app.email, copy.subject(app.position_applied), html)]);
    const failed = result[0].status === "rejected";
    await logEmail({
      kind: `job-status-${data.status}`,
      recipient: app.email,
      subject: copy.subject(app.position_applied),
      status: failed ? "failed" : "sent",
      error: failed ? String((result[0] as PromiseRejectedResult).reason?.message ?? "") : null,
      related_id: app.id,
      related_reference: app.reference ?? null,
    });
    return { ok: !failed };
  });

// ====================== JOB APPLICATION LOOKUP (PUBLIC) ======================
const lookupSchema = z.object({
  reference: z.string().trim().min(4).max(60),
  email: z.string().trim().email().max(255),
});

export const lookupJobApplication = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => lookupSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: app, error } = await supabaseAdmin
      .from("job_applications")
      .select("reference, full_name, position_applied, status, created_at")
      .eq("reference", data.reference.trim())
      .ilike("email", data.email.trim())
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!app) return { found: false as const };
    return { found: true as const, application: app };
  });

// ====================== ADMIN: SIGNED URL FOR RESUME ======================
const resumeUrlSchema = z.object({ path: z.string().min(1).max(500) });

export const getResumeSignedUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resumeUrlSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = data.path.replace(/^\/+/, "").replace(/^resumes\//, "");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("resumes")
      .createSignedUrl(path, 60 * 10); // 10 minutes
    if (error || !signed) {
      const msg = /not.?found/i.test(error?.message || "")
        ? "Resume file is missing from storage — the applicant's upload didn't complete. Please email them to resend."
        : error?.message || "Could not create download link";
      throw new Error(msg);
    }
    return { url: signed.signedUrl };
  });


// ====================== BLOG POST → NEWSLETTER BLAST ======================
const blogBlastSchema = z.object({ post_id: z.string().uuid() });

export const sendBlogPostNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => blogBlastSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image_url, author")
      .eq("id", data.post_id)
      .maybeSingle();
    if (error || !post) throw new Error("Post not found");

    const { data: subs, error: subErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email");
    if (subErr) throw new Error(subErr.message);
    const recipients = (subs ?? []).map((s) => s.email).filter(Boolean);
    if (recipients.length === 0) return { ok: true, sent: 0, failed: 0 };

    const url = `https://ojexoilandgasservices.lovable.app/blog/${encodeURIComponent(post.slug)}`;
    const safeCover = post.cover_image_url && /^https?:\/\//i.test(post.cover_image_url) ? post.cover_image_url : "";
    const coverHtml = safeCover
      ? `<img src="${esc(safeCover)}" alt="" style="width:100%;max-height:320px;object-fit:cover;border-radius:6px;margin:0 0 16px" />`
      : "";
    const excerptHtml = post.excerpt
      ? `<p style="color:#475569;line-height:1.6;font-size:15px">${esc(post.excerpt)}</p>`
      : "";
    const html = shell("New from OJEX", `
      ${coverHtml}
      <h2 style="color:#0a1f44;margin:0 0 10px">${esc(post.title)}</h2>
      ${post.author ? `<p style="color:#94a3b8;font-size:12px;margin:0 0 14px">By ${esc(post.author)}</p>` : ""}
      ${excerptHtml}
      <p style="margin-top:22px"><a href="${esc(url)}" style="display:inline-block;background:#d4af37;color:#0a1f44;padding:12px 22px;text-decoration:none;border-radius:4px;font-weight:600">Read the full article →</a></p>
      <p style="color:#94a3b8;font-size:11px;margin-top:24px">You are receiving this because you subscribed to OJEX Oil and Gas Services updates.</p>`);

    const subject = `${post.title} — OJEX`.slice(0, 180);
    let sent = 0;
    let failed = 0;
    // Send sequentially with small delay to be gentle on Gmail API
    for (const r of recipients) {
      try {
        await sendOne(r, subject, html);
        sent++;
        await logEmail({ kind: "blog-newsletter", recipient: r, subject, status: "sent", related_id: post.id, related_reference: post.slug });
      } catch (e: any) {
        failed++;
        await logEmail({ kind: "blog-newsletter", recipient: r, subject, status: "failed", error: String(e?.message ?? e), related_id: post.id, related_reference: post.slug });
      }
    }
    return { ok: failed === 0, sent, failed };
  });
