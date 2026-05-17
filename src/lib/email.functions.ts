import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ADMIN_EMAIL = "ojexoilandgasservices@gmail.com";

// HTML escape user-supplied values before interpolation
function esc(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function rfc2822(to: string, subject: string, html: string, from: string) {
  const boundary = "----=_OJEX_" + Math.random().toString(36).slice(2);
  const msg = [
    `From: OJEX Oil and Gas Services <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
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

function shell(title: string, accent: string, body: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;background:#fff">
    <div style="background:#0a1f44;color:#fff;padding:18px 20px;text-align:center">
      <h1 style="margin:0;font-size:20px;color:#d4af37">OJEX Oil and Gas Services</h1>
    </div>
    <div style="background:${accent};color:#0a1f44;padding:10px 20px;font-size:14px;font-weight:600">${esc(title)}</div>
    <div style="padding:22px;border:1px solid #e5e7eb;border-top:none">${body}</div>
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:12px 0">No 18 Okporo Road, Port Harcourt, Rivers State · +234 707 572 8373</p>
  </div>`;
}

function row(label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9">${esc(label)}</td><td style="padding:6px 12px;font-size:14px;border-bottom:1px solid #f1f5f9">${esc(value)}</td></tr>`;
}

async function dispatch(customer: { email: string; subject: string; html: string }, admin: { subject: string; html: string }) {
  const results = await Promise.allSettled([
    sendOne(customer.email, customer.subject, customer.html),
    sendOne(ADMIN_EMAIL, admin.subject, admin.html),
  ]);
  const errors = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown");
  return { ok: errors.length === 0, errors };
}

// ====================== QUOTES ======================
const idSchema = z.object({ id: z.string().uuid() });

export const sendQuoteEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: q, error } = await supabaseAdmin.from("quote_requests").select("*").eq("id", data.id).single();
    if (error || !q) throw new Error("Quote not found");

    const customerHtml = shell("Quote request received", "#d4af37", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(q.contact_name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your quote request for <strong>${esc(q.product_service)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Our team will respond within <strong>24 hours</strong> with pricing, lead time, and terms.</p>
      <p style="color:#475569;line-height:1.6">For urgent matters, WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>`);

    const adminHtml = shell("🔔 New Quote Request", "#d4af37", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Company", q.company_name)}${row("Contact", q.contact_name)}${row("Email", q.email)}
        ${row("Phone", q.phone)}${row("Product/Service", q.product_service)}${row("Quantity", q.quantity)}
        ${row("Delivery Location", q.delivery_location)}${row("Timeline", q.timeline)}${row("Budget", q.budget)}${row("Notes", q.notes)}
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/quotes</p>`);

    return dispatch(
      { email: q.email, subject: "We received your quote request — OJEX", html: customerHtml },
      { subject: `New quote: ${q.company_name} — ${q.product_service}`.slice(0, 180), html: adminHtml },
    );
  });

// ====================== CONTACT ======================
export const sendContactEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: c, error } = await supabaseAdmin.from("contact_messages").select("*").eq("id", data.id).single();
    if (error || !c) throw new Error("Contact message not found");

    const customerHtml = shell("Message received", "#d4af37", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(c.name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your message and will respond within <strong>1 business day</strong>.</p>
      <p style="color:#475569;line-height:1.6">If urgent, WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>`);

    const adminHtml = shell("📨 New Contact Message", "#d4af37", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", c.name)}${row("Email", c.email)}${row("Phone", c.phone)}${row("Company", c.company)}${row("Subject", c.subject)}
      </table>
      <div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(c.message)}</div>`);

    return dispatch(
      { email: c.email, subject: "We received your message — OJEX", html: customerHtml },
      { subject: `Contact: ${c.subject || c.name}`.slice(0, 180), html: adminHtml },
    );
  });

// ====================== JOB APPLICATIONS ======================
export const sendJobApplicationEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: a, error } = await supabaseAdmin.from("job_applications").select("*").eq("id", data.id).single();
    if (error || !a) throw new Error("Application not found");

    const customerHtml = shell("Application received", "#d4af37", `
      <h2 style="color:#0a1f44;margin-top:0">Thank you, ${esc(a.full_name)}!</h2>
      <p style="color:#475569;line-height:1.6">We have received your application for <strong>${esc(a.position_applied)}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Our recruitment team reviews every application carefully and will contact shortlisted candidates within <strong>5–10 business days</strong>.</p>`);

    const adminHtml = shell("👤 New Job Application", "#d4af37", `
      <table style="width:100%;border-collapse:collapse">
        ${row("Name", a.full_name)}${row("Email", a.email)}${row("Phone", a.phone)}
        ${row("Position", a.position_applied)}${row("Experience (yrs)", a.experience_years)}${row("Resume URL", a.resume_url)}
      </table>
      ${a.cover_letter ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:6px;font-size:14px;white-space:pre-wrap">${esc(a.cover_letter)}</div>` : ""}
      <p style="margin-top:16px;font-size:12px;color:#64748b">Open in admin → /admin/jobs</p>`);

    return dispatch(
      { email: a.email, subject: "We received your application — OJEX", html: customerHtml },
      { subject: `Application: ${a.full_name} — ${a.position_applied}`.slice(0, 180), html: adminHtml },
    );
  });
