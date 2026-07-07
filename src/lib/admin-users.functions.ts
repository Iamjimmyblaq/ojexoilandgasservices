import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OFFICIAL_ADMIN = "ojexoilandgasservices@gmail.com";

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(userId: string) {
  const supabaseAdmin = await getAdminClient();
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdminClient();
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));
  });

const setRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "manager", "user"]),
  enabled: z.boolean(),
});

const deleteUserSchema = z.object({
  user_id: z.string().uuid(),
});

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setRoleSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdminClient();

    // Protect the official admin account: cannot remove admin from it
    if (data.role === "admin" && !data.enabled) {
      const { data: target } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
      if (target?.user?.email?.toLowerCase() === OFFICIAL_ADMIN) {
        throw new Error("Cannot remove admin role from the official OJEX admin account.");
      }
    }

    if (data.enabled) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = await getAdminClient();

    if (data.user_id === context.userId) {
      throw new Error("You cannot delete your own admin account while signed in.");
    }

    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
    if (targetError) throw targetError;
    if (target?.user?.email?.toLowerCase() === OFFICIAL_ADMIN) {
      throw new Error("Cannot delete the official OJEX admin account.");
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw error;
    return { ok: true };
  });
