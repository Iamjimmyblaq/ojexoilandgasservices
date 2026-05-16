import { useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;
  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      {canGoBack ? (
        <button
          onClick={() => router.history.back()}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 hover:text-[color:var(--gold)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : null}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-white/80 transition hover:border-[color:var(--gold)] hover:bg-[color:var(--gold)]/10 hover:text-[color:var(--gold)]"
      >
        <Home className="h-4 w-4" /> Home
      </Link>
    </div>
  );
}
