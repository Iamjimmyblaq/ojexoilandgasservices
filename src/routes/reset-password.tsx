import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Set new password — OJEX" }, { name: "robots", content: "noindex" }] }),
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash and fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Please sign in.");
      await supabase.auth.signOut();
      nav({ to: "/auth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Account" title="Set a new password." subtitle="Choose a strong password you haven't used before." />
      <section className="section">
        <div className="container-x mx-auto max-w-md rounded-lg border border-border bg-card p-8">
          {!ready ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">This page must be opened from the password-reset link in your email.</p>
              <Link to="/forgot-password" className="text-[color:var(--gold-deep)] underline text-sm">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">New password</label>
                <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm password</label>
                <input type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
              </div>
              <button disabled={busy} className="btn-gold w-full">{busy ? "Updating…" : "Update password"}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
