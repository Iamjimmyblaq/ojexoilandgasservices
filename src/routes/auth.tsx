import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — OJEX" }, { name: "robots", content: "noindex" }] }),
});

async function routeAfterAuth(userId: string, nav: (opts: { to: string }) => void) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (roles.includes("admin") || roles.includes("manager")) nav({ to: "/admin" });
  else nav({ to: "/" });
}

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) routeAfterAuth(data.session.user.id, nav);
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to verify.");
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        if (signInData.user) await routeAfterAuth(signInData.user.id, nav);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Internal Portal" title={mode === "signin" ? "Sign in." : "Create account."} subtitle="Staff and authorised partners only." />
      <section className="section">
        <div className="container-x mx-auto max-w-md rounded-lg border border-border bg-card p-8">
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium">Full name</label>
                <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Password</label>
                {mode === "signin" && (
                  <Link to="/forgot-password" className="text-xs text-[color:var(--gold-deep)] underline">Forgot password?</Link>
                )}
              </div>
              <input type="password" minLength={8} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button disabled={busy} className="btn-gold w-full">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Need an account?" : "Have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-[color:var(--gold-deep)] underline">
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/">← Back to website</Link>
          </p>
        </div>
      </section>
    </>
  );
}
