import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  return String(s ?? "").replace(/[\r\n]+/g, " ").trim();
}

function rfc2822(to: string, subject: string, html: string, from: string) {
  const safeTo = sanitizeHeader(to);
  const safeFrom = sanitizeHeader(from);
  const safeSubject = sanitizeHeader(subject);
  const boundary = "----=_OJEX_" + Math.random().toString(36).slice(2);
  const msg = [
    `From: OJEX Oil and Gas Services <${safeFrom}>`,
    `To: ${safeTo}`,
    `Subject: ${safeSubject}`,
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
});

export const sendQuoteEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = shell("Quote request received", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(data.contact_name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your quote request for <strong>${esc(data.product_service)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Our team will respond within <strong>24 hours</strong> with pricing, lead time, and terms.</p>
      <p style="color:#475569;line-height:1.6">For urgent matters, WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>`);

    const adminHtml = shell("🔔 New Quote Request", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Company", data.company_name)}${row("Contact", data.contact_name)}${row("Email", data.email)}
        ${row("Phone", data.phone)}${row("Product/Service", data.product_service)}${row("Quantity", data.quantity)}
        ${row("Delivery Location", data.delivery_location)}${row("Timeline", data.timeline)}${row("Budget", data.budget)}${row("Notes", data.notes)}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/quotes</p>`);

    return dispatch(
      { email: data.email, subject: "We received your quote request — OJEX", html: customerHtml },
      { subject: `New quote: ${data.company_name} — ${data.product_service}`.slice(0, 180), html: adminHtml },
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
});

export const sendJobApplicationEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => jobAppSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = shell("Application received", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(data.full_name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your application for <strong>${esc(data.position_applied)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Our recruitment team reviews every application carefully and will contact shortlisted candidates within <strong>5–10 business days</strong>.</p>`);

    const adminHtml = shell("👤 New Job Application", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", data.full_name)}${row("Email", data.email)}${row("Phone", data.phone)}
        ${row("Position", data.position_applied)}${row("Experience (yrs)", data.experience_years)}${row("Resume URL", data.resume_url)}
      </table>
      ${data.cover_letter ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(data.cover_letter)}</div>` : ""}
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/jobs</p>`);

    return dispatch(
      { email: data.email, subject: "We received your application — OJEX", html: customerHtml },
      { subject: `Application: ${data.full_name} — ${data.position_applied}`.slice(0, 180), html: adminHtml },
    );
  });
