import type { Chapter } from "@/content/site";
import { ending, footer, intro, links, person } from "@/content/site";

/**
 * The words. These components know nothing about scroll; the desktop and
 * mobile layouts decide where and when to show them.
 *
 * Text sits directly on the sky, like captions in a quiet pixel-art scene:
 * pixel font for short labels and questions, serif for headings, a humanist
 * sans for the one or two sentences of body.
 */

const pixelLabel = "font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-ivory/60 md:text-[0.65rem]";

export function IntroPanel({ className }: { className?: string }) {
  return (
    <header className={className}>
      <p className={pixelLabel}>{intro.kicker}</p>
      <h1 className="mt-4 font-serif leading-[0.9] text-ivory">
        <span className="block text-[clamp(4.5rem,15vw,11rem)] font-medium tracking-tight">
          {intro.title}
        </span>
        <span className="mt-3 block font-pixel text-[clamp(0.8rem,1.6vw,1.1rem)] tracking-[0.2em] text-shell">
          {intro.subtitle}
        </span>
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ivory/85 md:mt-8 md:text-lg">
        {intro.thesis}
      </p>
      <p className={`mt-5 flex flex-wrap gap-x-3 gap-y-1 ${pixelLabel}`}>
        {person.interests.map((interest) => (
          <span key={interest}>{interest}</span>
        ))}
      </p>
    </header>
  );
}

type ChapterPanelProps = {
  chapter: Chapter;
  className?: string;
  /** 0→1 visibility of the heading; it fades in from above. */
  heading?: number;
  /** 0→1 fraction of the body that has been typed so far. */
  typed?: number;
  /** Show the milestone list (mobile). On desktop the items float in the scene instead. */
  showItems?: boolean;
  /** Centre the block (desktop caption at the top of the scene). */
  centered?: boolean;
};

/**
 * Scroll-driven typewriter. The full text is always in the DOM for screen
 * readers; the visible copy grows with `progress`.
 */
function Typed({ text, progress, className }: { text: string; progress: number; className?: string }) {
  const count = Math.round(text.length * Math.min(1, Math.max(0, progress)));
  const done = count >= text.length;
  return (
    <p className={`relative ${className ?? ""}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        {text.slice(0, count)}
        {!done && <span className="cursor ml-px inline-block h-[0.9em] w-[0.5em] translate-y-[0.15em] bg-ivory/80" />}
      </span>
    </p>
  );
}

export function ChapterPanel({
  chapter,
  className,
  heading = 1,
  typed = 1,
  showItems = false,
  centered = false,
}: ChapterPanelProps) {
  const headingId = `chapter-${chapter.id}-heading`;
  return (
    <section
      aria-labelledby={headingId}
      className={`scrim ${centered ? "mx-auto max-w-[36rem] text-center" : ""} ${className ?? ""}`}
    >
      <p className={pixelLabel}>Chapter {chapter.number}</p>
      <p className="mt-4 font-pixel text-[0.75rem] leading-[2] text-ivory md:text-[0.85rem]">
        {chapter.question}
      </p>
      <h2
        id={headingId}
        className="mt-6 font-serif text-[1.75rem] font-medium leading-tight tracking-tight text-ivory md:text-[2rem]"
        style={{ opacity: heading, transform: `translateY(${Math.round((1 - heading) * -10)}px)` }}
      >
        {chapter.heading}
      </h2>
      <Typed
        text={chapter.body}
        progress={typed}
        className={`mt-3 text-[0.92rem] leading-relaxed text-ivory/85 ${centered ? "mx-auto max-w-[30rem]" : "max-w-[26rem]"}`}
      />
      {showItems && chapter.items && (
        <ul className="mt-6 space-y-3 border-t border-ivory/15 pt-5">
          {chapter.items.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-[0.4rem] block h-1.5 w-1.5 shrink-0 bg-surf" aria-hidden="true" />
              <div>
                <p className="font-pixel text-[0.62rem] tracking-wide text-ivory">
                  {item.href ? (
                    <a href={item.href} className="underline decoration-surf underline-offset-4">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="mt-1 text-[0.82rem] leading-snug text-ivory/65">{item.note}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function EndingPanel({ className }: { className?: string }) {
  return (
    <section aria-labelledby="ending-heading" className={`scrim ${className ?? ""}`}>
      <p className={pixelLabel}>{ending.number} · The lighthouse</p>
      <h2
        id="ending-heading"
        className="mt-4 font-serif text-[1.9rem] font-medium leading-tight tracking-tight text-ivory md:text-[2.25rem]"
      >
        {ending.heading}
      </h2>
      <p className="mt-3 max-w-[26rem] text-[0.92rem] leading-relaxed text-ivory/80">{ending.body}</p>
      <p className="mt-5 font-pixel text-[0.7rem] leading-[1.9] text-surf">{ending.note}</p>
      <nav aria-label="Links" className="mt-7 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className="inline-flex items-center gap-2 border border-ivory/50 px-3 py-2 font-pixel text-[0.6rem] uppercase tracking-[0.12em] text-ivory transition-colors hover:border-ivory hover:bg-ivory hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-poppy"
          >
            {link.label}
            {link.external && (
              <span aria-hidden="true" className="text-[0.55rem]">
                ↗
              </span>
            )}
          </a>
        ))}
      </nav>
      <p className={`mt-8 ${pixelLabel}`}>{footer.signature}</p>
      <p className="mt-2 text-[0.7rem] leading-relaxed text-ivory/45">{footer.line}</p>
    </section>
  );
}
