import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ email: z.string().trim().email().max(255) });

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) { toast.error("Please enter a valid email."); return; }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.email });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) { toast.error("Could not subscribe. Try again."); return; }
    toast.success("Subscribed. Welcome aboard.");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[color:var(--gold)] focus:outline-none"
      />
      <button disabled={loading} className="btn-gold !py-2.5 !text-xs disabled:opacity-60">
        {loading ? "..." : "Join"}
      </button>
    </form>
  );
}
