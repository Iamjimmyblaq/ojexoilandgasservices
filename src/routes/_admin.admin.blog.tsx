import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { sendBlogPostNewsletter } from "@/lib/email.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, Send, X } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/blog")({ component: AdminBlog });

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function emptyForm(): Partial<Post> {
  return { title: "", slug: "", excerpt: "", content: "", cover_image_url: "", author: "", published: false };
}

function AdminBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [uploading, setUploading] = useState(false);
  const sendBlast = useServerFn(sendBlogPostNewsletter);

  const posts = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  const save = useMutation({
    mutationFn: async (form: Partial<Post>) => {
      const title = (form.title ?? "").trim();
      const content = (form.content ?? "").trim();
      if (!title || !content) throw new Error("Title and content are required");
      const slug = (form.slug && form.slug.trim()) || slugify(title);
      const wasPublished = form.id ? !!(posts.data?.find((p) => p.id === form.id)?.published) : false;
      const willPublish = !!form.published;
      const payload: any = {
        title,
        slug,
        excerpt: form.excerpt?.trim() || null,
        content,
        cover_image_url: form.cover_image_url?.trim() || null,
        author: form.author?.trim() || null,
        published: willPublish,
        published_at: willPublish ? (form.published_at || new Date().toISOString()) : null,
      };
      let saved: Post;
      if (form.id) {
        const { data, error } = await supabase.from("blog_posts").update(payload).eq("id", form.id).select().single();
        if (error) throw error;
        saved = data as Post;
      } else {
        const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
        if (error) throw error;
        saved = data as Post;
      }
      const shouldNotify = willPublish && !wasPublished;
      return { saved, shouldNotify };
    },
    onSuccess: async ({ saved, shouldNotify }) => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts-public"] });
      setEditing(null);
      toast.success("Post saved");
      if (shouldNotify) {
        toast.info("Sending newsletter to subscribers…");
        try {
          const res = await sendBlast({ data: { post_id: saved.id } });
          toast.success(`Newsletter sent to ${res.sent} subscriber(s)${res.failed ? `, ${res.failed} failed` : ""}.`);
        } catch (e: any) {
          toast.error(e?.message || "Newsletter send failed");
        }
      }
    },
    onError: (e: any) => toast.error(e?.message || "Could not save"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts-public"] });
      toast.success("Post deleted");
    },
    onError: (e: any) => toast.error(e?.message || "Could not delete"),
  });

  async function notifySubscribers(id: string) {
    if (!confirm("Send this post to all newsletter subscribers now?")) return;
    toast.info("Sending newsletter…");
    try {
      const res = await sendBlast({ data: { post_id: id } });
      toast.success(`Sent to ${res.sent} subscriber(s)${res.failed ? `, ${res.failed} failed` : ""}.`);
    } catch (e: any) {
      toast.error(e?.message || "Newsletter send failed");
    }
  }

  async function uploadImage(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditing((prev) => ({ ...(prev ?? {}), cover_image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog & Newsletter</h1>
          <p className="text-sm text-muted-foreground">Publish posts and notify newsletter subscribers automatically.</p>
        </div>
        <button onClick={() => setEditing(emptyForm())} className="btn-gold inline-flex items-center gap-2 !py-2 !text-sm">
          <Plus className="h-4 w-4" /> New post
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : !posts.data?.length ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No posts yet. Create your first one.</td></tr>
            ) : posts.data.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Published</span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(p.published_at || p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {p.published && (
                      <button onClick={() => notifySubscribers(p.id)} title="Resend to subscribers" className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => setEditing(p)} title="Edit" className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => confirm(`Delete "${p.title}"?`) && del.mutate(p.id)} title="Delete" className="rounded p-2 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-lg bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">{editing.id ? "Edit post" : "New post"}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Title *</label>
                <input
                  required maxLength={200}
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Slug</label>
                  <input
                    value={editing.slug ?? ""}
                    onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Author</label>
                  <input
                    value={editing.author ?? ""}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Cover image</label>
                {editing.cover_image_url ? (
                  <div className="relative inline-block">
                    <img src={editing.cover_image_url} alt="" className="h-40 rounded border border-border object-cover" />
                    <button type="button" onClick={() => setEditing({ ...editing, cover_image_url: "" })}
                      className="absolute right-1 top-1 rounded bg-red-600/90 p-1 text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground hover:border-[color:var(--gold)] hover:text-foreground">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Click to upload (JPG/PNG, max 5MB)"}
                    <input type="file" accept="image/*" disabled={uploading} className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
                  </label>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Excerpt</label>
                <textarea
                  rows={2} maxLength={300}
                  value={editing.excerpt ?? ""}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Short summary shown on the blog index and in the email."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Content *</label>
                <textarea
                  required rows={12}
                  value={editing.content ?? ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">Plain text. Line breaks are preserved.</p>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox"
                  checked={!!editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                />
                Publish now {editing.id && posts.data?.find((p) => p.id === editing.id)?.published ? "(already published)" : "— this will email all newsletter subscribers"}
              </label>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={() => setEditing(null)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={save.isPending} className="btn-gold !py-2 !text-sm disabled:opacity-60">
                  {save.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
