/** Client-side resume validation: extension, MIME, size, and magic-byte sniffing. */

export const MAX_RESUME_BYTES = 8 * 1024 * 1024; // 8MB
export const MIN_RESUME_BYTES = 1024; // 1KB — anything smaller is empty/corrupt

export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"] as const;

export type ResumeCheck = { ok: true; extension: string } | { ok: false; message: string };

function extensionOf(name: string) {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1]! : "";
}

function startsWith(bytes: Uint8Array, sig: number[]) {
  return sig.every((b, i) => bytes[i] === b);
}

/** True document signatures: %PDF-, PK\x03\x04 (docx/zip), D0 CF 11 E0 (legacy .doc). */
function sniff(bytes: Uint8Array): "pdf" | "zip" | "ole" | "unknown" {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf";
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06])) return "zip";
  if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) return "ole";
  return "unknown";
}

export async function validateResume(file: File): Promise<ResumeCheck> {
  const ext = extensionOf(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return { ok: false, message: "Resume must be a PDF, DOC, or DOCX file." };
  }
  if (file.type && !ALLOWED_RESUME_TYPES.includes(file.type as (typeof ALLOWED_RESUME_TYPES)[number])) {
    return { ok: false, message: "That file type isn't supported. Please upload a PDF, DOC, or DOCX." };
  }
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, message: `Resume must be smaller than 8MB (yours is ${Math.round(file.size / 1024 / 1024 * 10) / 10}MB).` };
  }
  if (file.size < MIN_RESUME_BYTES) {
    return { ok: false, message: "That file looks empty or corrupt. Please upload a valid resume." };
  }

  // Content scan: reject files whose bytes don't match a real document.
  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  } catch {
    return { ok: false, message: "We couldn't read that file. Please try re-saving it and upload again." };
  }
  const kind = sniff(head);
  if (kind === "unknown") {
    return { ok: false, message: "That file doesn't look like a valid PDF or Word document. Please re-export it and try again." };
  }
  if (ext === "pdf" && kind !== "pdf") {
    return { ok: false, message: "The file is named .pdf but isn't a real PDF. Please upload the original document." };
  }
  if (ext === "docx" && kind !== "zip") {
    return { ok: false, message: "The file is named .docx but isn't a valid Word document. Please re-save it as .docx or PDF." };
  }
  if (ext === "doc" && kind !== "ole" && kind !== "zip") {
    return { ok: false, message: "The file is named .doc but isn't a valid Word document. Please re-save it as .docx or PDF." };
  }

  return { ok: true, extension: ext };
}

/** Safe, collision-free storage object name. */
export function safeResumeName(originalName: string, extension: string) {
  const base = originalName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60) || "resume";
  return `${base}.${extension}`;
}
