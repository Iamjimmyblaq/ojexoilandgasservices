import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { generateVendorReference } from "../src/components/forms/VendorForm";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://kvhqhwaaujoljroxhoze.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aHFod2FhdWpvbGpyb3hob3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDg2MjksImV4cCI6MjA5NDMyNDYyOX0.0A7EyayYGZ2BUfeBh1OnnYcgbAWbggomJJzgZVRREjo";

// Anonymous client — same posture as the public vendor registration form.
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

describe("Vendor reference generator", () => {
  it("matches VEN-YYMMDD-XXXXXX format", () => {
    const ref = generateVendorReference(new Date(Date.UTC(2026, 5, 8)));
    expect(ref).toMatch(/^VEN-260608-[A-HJ-NP-Z2-9]{6}$/);
  });

  it("produces unique values", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateVendorReference()));
    expect(set.size).toBeGreaterThan(195);
  });
});

describe("Vendor registration (anonymous submission)", () => {
  it("inserts a vendor registration end-to-end", async () => {
    const ref = generateVendorReference();
    const payload = {
      company_name: `Test Vendor ${ref}`,
      contact_name: "Automated Tester",
      email: `test+${ref.toLowerCase()}@example.com`,
      phone: "+10000000000",
      country: "Testland",
      website: "https://example.com",
      category: "QA Automation",
      capabilities: "End-to-end submission validation",
    };

    const { error } = await anon.from("vendor_registrations").insert(payload);
    expect(error, error ? `insert failed: ${error.message}` : "").toBeNull();
  }, 30_000);

  it("rejects an invalid email per the public RLS check", async () => {
    const { error } = await anon.from("vendor_registrations").insert({
      company_name: "Bad Email Co",
      contact_name: "Tester",
      email: "not-an-email",
      category: "QA",
    });
    expect(error).not.toBeNull();
  }, 30_000);
});
