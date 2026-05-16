import { BackButton } from "./BackButton";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  hideBack?: boolean;
}

export function PageHero({ eyebrow, title, subtitle, hideBack }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--navy-deep)] py-20 sm:py-28">
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--gold)_1px,transparent_1px),linear-gradient(90deg,var(--gold)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -right-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[color:var(--gold)]/10 blur-3xl" />
      <div className="container-x relative">
        {!hideBack && <BackButton className="mb-6" />}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/70">{subtitle}</p>}
      </div>
    </section>
  );
}
