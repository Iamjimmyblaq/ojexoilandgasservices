import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const ADMIN_EMAIL = "ojexoilandgasservices@gmail.com";

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
  if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");
  if (!gmailKey) throw new Error("GOOGLE_MAIL_API_KEY missing");

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

const quoteSchema = z.object({
  company_name: z.string().min(1).max(160),
  contact_name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  phone: z.string().max(40).optional().nullable(),
  product_service: z.string().min(1).max(300),
  quantity: z.string().max(80).optional().nullable(),
  delivery_location: z.string().max(200).optional().nullable(),
  timeline: z.string().max(120).optional().nullable(),
  budget: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

function row(label: string, value: string | null | undefined) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9">${label}</td><td style="padding:6px 12px;font-size:14px;border-bottom:1px solid #f1f5f9">${value}</td></tr>`;
}

export const sendQuoteEmails = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => quoteSchema.parse(input))
  .handler(async ({ data }) => {
    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#fff">
        <div style="background:#0a1f44;color:#fff;padding:20px;text-align:center">
          <h1 style="margin:0;font-size:22px;color:#d4af37">OJEX Oil and Gas Services</h1>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-top:none">
          <h2 style="color:#0a1f44;margin-top:0">Thank you, ${data.contact_name}!</h2>
          <p style="color:#475569;line-height:1.6">We have received your quote request for <strong>${data.product_service}</strong>.</p>
          <p style="color:#475569;line-height:1.6">Our team will review your requirements and respond within <strong>24 hours</strong> with pricing, lead time, and terms.</p>
          <p style="color:#475569;line-height:1.6">For urgent matters, reach us on WhatsApp: <a href="https://wa.me/2347075728373" style="color:#d4af37">+234 707 572 8373</a></p>
          <p style="color:#64748b;font-size:13px;margin-top:32px">— The OJEX Team<br/>No 18 Okporo Road, Port Harcourt, Rivers State</p>
        </div>
      </div>`;

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;background:#fff">
        <div style="background:#d4af37;color:#0a1f44;padding:16px 20px">
          <h1 style="margin:0;font-size:18px">🔔 New Quote Request</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none">
          ${row("Company", data.company_name)}
          ${row("Contact", data.contact_name)}
          ${row("Email", data.email)}
          ${row("Phone", data.phone)}
          ${row("Product/Service", data.product_service)}
          ${row("Quantity", data.quantity)}
          ${row("Delivery Location", data.delivery_location)}
          ${row("Timeline", data.timeline)}
          ${row("Budget", data.budget)}
          ${row("Notes", data.notes)}
        </table>
        <p style="margin-top:16px;font-size:12px;color:#64748b">View in admin → /admin/quotes</p>
      </div>`;

    const results = await Promise.allSettled([
      sendOne(data.email, "We received your quote request — OJEX", customerHtml),
      sendOne(ADMIN_EMAIL, `New quote: ${data.company_name} — ${data.product_service}`, adminHtml),
    ]);
    const errors = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown");
    return { ok: errors.length === 0, errors };
  });
