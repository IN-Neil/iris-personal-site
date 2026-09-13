import type { Chapter } from "@/content/site";
import { ending, footer, intro, links, person } from "@/content/site";

/**
 * The words. These components know nothing about scroll; the desktop and
 * mobile layouts decide where and when to show them.
 */

export function IntroPanel({ className }: { className?: string }) {
  return (
    <header className={className}>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink/70 md:text-xs">
        {intro.kicker}
      </p>
      <h1 className="mt-4 font-serif leading-[0.9] text-ink">
        <span className="block text-[clamp(4.5rem,15vw,11rem)] font-medium tracking-tight">
          {intro.title}
        </span>
        <span className="mt-2 block text-[clamp(1.25rem,3.2vw,2.25rem)] font-light tracking-[0.08em] text-slate">
          {intro.subtitle}
        </span>
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink/85 md:mt-8 md:text-lg">
        {intro.thesis}
      </p>
      <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-slate/80">
        {person.interests.map((interest) => (
          <span key={interest}>{interest}</span>
        ))}
      </p>
    </header>
  );
}

export function ChapterPanel({ chapter, className }: { chapter: Chapter; className?: string }) {
  const headingId = `chapter-${chapter.id}-heading`;
  return (
    <section aria-labelledby={headingId} className={`paper ${className ?? ""}`}>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-slate">
        Chapter {chapter.number}
      </p>
      <p className="mt-3 font-serif text-lg italic leading-snug text-ocean md:text-xl">
        “{chapter.question}”
      </p>
      <h2 id={headingId} className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
        {chapter.heading}
      </h2>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/85 md:text-base">{chapter.body}</p>
      {chapter.items && (
        <div className="mt-6 border-t border-ink/15 pt-4">
          {chapter.itemsTitle && (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-slate">
              {chapter.itemsTitle}
            </p>
          )}
          <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {chapter.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-[0.45rem] block h-2 w-2 shrink-0 bg-surf" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="underline decoration-surf decoration-2 underline-offset-[3px] hover:text-ocean"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </p>
                  <p className="text-[0.8rem] leading-snug text-ink/65">{item.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function EndingPanel({ className }: { className?: string }) {
  return (
    <section aria-labelledby="ending-heading" className={`paper ${className ?? ""}`}>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-slate">
        {ending.number} · The lighthouse
      </p>
      <h2 id="ending-heading" className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
        {ending.heading}
      </h2>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/85 md:text-base">{ending.body}</p>
      <p className="mt-4 font-serif italic text-ocean">{ending.note}</p>
      <nav aria-label="Links" className="mt-6 flex flex-wrap gap-2 border-t border-ink/15 pt-5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className="inline-flex items-center gap-2 border border-ink bg-ivory px-3.5 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-poppy active:translate-y-0 active:shadow-none"
          >
            {link.label}
            {link.external && (
              <span aria-hidden="true" className="text-[0.65rem]">
                ↗
              </span>
            )}
          </a>
        ))}
      </nav>
      <p className="mt-6 text-[0.7rem] leading-relaxed text-ink/55">{footer.line}</p>
    </section>
  );
}
