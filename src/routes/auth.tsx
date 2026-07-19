import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
          <button
            type="button"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
              if (result.error) toast.error(result.error.message || "Google sign-in failed");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.85 14.12A6.98 6.98 0 0 1 5.5 12c0-.74.13-1.46.35-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.67-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>
          <div className="my-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
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
