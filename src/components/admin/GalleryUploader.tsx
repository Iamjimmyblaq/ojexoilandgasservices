import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  productSlug?: string;
  primaryUrl?: string | null;
  onPrimaryChange?: (url: string) => void;
};

export function GalleryUploader({ value, onChange, productSlug, primaryUrl, onPrimaryChange }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const folder = productSlug || "untagged";
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length) {
      onChange([...value, ...uploaded]);
      if (!primaryUrl && onPrimaryChange) onPrimaryChange(uploaded[0]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
    setUploading(false);
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading…" : "Click to upload product photos (JPG/PNG, max 5MB each)"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url) => {
            const isPrimary = url === primaryUrl;
            return (
              <div key={url} className="group relative aspect-square overflow-hidden rounded border border-border bg-muted">
                <img src={url} alt="" className="h-full w-full object-cover" />
                {isPrimary && (
                  <span className="absolute left-1 top-1 rounded bg-[color:var(--gold)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--navy-deep)]">
                    Cover
                  </span>
                )}
                <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                  {!isPrimary && onPrimaryChange && (
                    <button
                      type="button"
                      onClick={() => onPrimaryChange(url)}
                      className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[color:var(--navy-deep)]"
                      title="Set as cover"
                    >
                      <ImageIcon className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(url)}
                    className="ml-auto rounded bg-red-600/90 p-1 text-white"
                    title="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
