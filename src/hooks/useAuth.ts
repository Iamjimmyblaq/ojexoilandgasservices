import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

async function fetchRoles(userId: string): Promise<string[]> {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: { role: string }) => r.role);
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const r = await fetchRoles(s.user.id);
          if (mounted) setRoles(r);
        }, 0);
      } else {
        setRoles([]);
      }
    });
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        const r = await fetchRoles(data.session.user.id);
        if (!mounted) return;
        setRoles(r);
      }
      setLoading(false);
    })();
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return {
    session, user, loading, roles,
    isAdmin: roles.includes("admin"),
    isManager: roles.includes("manager") || roles.includes("admin"),
    signOut: () => supabase.auth.signOut(),
  };
}
