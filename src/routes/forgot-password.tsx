import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — OJEX" }, { name: "robots", content: "noindex" }] }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent. Check your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Forgot password." subtitle="We'll email you a secure link to set a new password." />
      <section className="section">
        <div className="container-x mx-auto max-w-md rounded-lg border border-border bg-card p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm">If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
              <Link to="/auth" className="text-[color:var(--gold-deep)] underline text-sm">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
              </div>
              <button disabled={busy} className="btn-gold w-full">{busy ? "Sending…" : "Send reset link"}</button>
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/auth">← Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
