const TONES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-800",
  sourcing: "bg-amber-100 text-amber-800",
  quoted: "bg-violet-100 text-violet-800",
  contacted: "bg-violet-100 text-violet-800",
  reviewing: "bg-amber-100 text-amber-800",
  shortlisted: "bg-cyan-100 text-cyan-800",
  approved: "bg-emerald-100 text-emerald-800",
  ordered: "bg-emerald-100 text-emerald-800",
  delivered: "bg-emerald-200 text-emerald-900",
  closed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-emerald-100 text-emerald-800",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${TONES[status] ?? "bg-gray-100 text-gray-700"}`}>{status}</span>;
}
