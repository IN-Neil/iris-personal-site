import type { Chapter } from "@/content/site";
import { ending, footer, intro, links, person, questionFragments } from "@/content/site";

/**
 * The words. These components know nothing about scroll; the desktop and
 * mobile layouts decide where and when to show them.
 *
 * Text sits directly on the sky, like captions in a quiet pixel-art scene:
 * pixel font for short labels and questions, serif for headings, a humanist
 * sans for the one or two sentences of body.
 */

const pixelLabel = "font-pixel text-[0.72rem] uppercase tracking-[0.14em] text-mist/60 md:text-[0.78rem]";
const endingHeading = "journey-ending-heading mt-4 font-pixel text-[1.5rem] font-medium leading-[1.3] text-mist md:text-[1.8rem]";

/**
 * Kept deliberately spare: a name, the big pixel title, one sentence.
 * The subtitle and interests still live in `site.ts` for the brand mark and
 * the mobile layout.
 */
export function IntroPanel({ className, full = false }: { className?: string; full?: boolean }) {
  return (
    <header className={className}>
      <p className="font-serif text-[1.15rem] text-mist/85">Hello, I’m</p>
      <h1 className="mt-3 font-pixel font-bold leading-none text-mist">
        <span className="block text-[clamp(4rem,11vw,8.5rem)] tracking-[0.02em]">{intro.title}</span>
        {full && (
          <span className="mt-3 block text-[clamp(1rem,1.8vw,1.35rem)] tracking-[0.12em] text-shell">
            {intro.subtitle}
          </span>
        )}
      </h1>
      <p className="mt-5 max-w-[24rem] font-serif text-[1.05rem] leading-relaxed text-mist/85 md:text-[1.1rem]">
        {intro.thesis}
      </p>
      {full && (
        <p className={`mt-5 flex flex-wrap gap-x-3 gap-y-1 ${pixelLabel}`}>
          {person.interests.map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </p>
      )}
    </header>
  );
}

type ChapterPanelProps = {
  chapter: Chapter;
  className?: string;
  /** 0→1 visibility of the question; it fades in from above. */
  heading?: number;
  /** 0→1 fraction of the body that has been typed so far. */
  typed?: number;
  /** Show the milestone list (mobile). On desktop the items float in the scene instead. */
  showItems?: boolean;
  /** Desktop close-up layout: the chapter label is rendered separately. */
  centered?: boolean;
  /** Unique heading IDs when desktop and phone layouts coexist in the DOM. */
  idPrefix?: string;
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
        {!done && <span className="cursor ml-px inline-block h-[0.9em] w-[0.5em] translate-y-[0.15em] bg-mist/80" />}
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
  idPrefix = "",
}: ChapterPanelProps) {
  const headingId = `${idPrefix}chapter-${chapter.id}-heading`;
  return (
    <section aria-labelledby={headingId} className={className}>
      {/* On desktop the chapter label lives at the top-left of the frame (see Journey). */}
      {!centered && (
        <p className="font-serif text-sm text-mist/70">
          Chapter {Number(chapter.number)} · {chapter.heading}
        </p>
      )}
      <h2
        id={headingId}
        className="journey-question mt-3 font-pixel text-[1.35rem] font-medium leading-[1.3] text-mist md:text-[1.7rem]"
        style={{ opacity: heading, transform: `translateY(${Math.round((1 - heading) * -10)}px)` }}
      >
        {chapter.question}
      </h2>
      <Typed
        text={chapter.body}
        progress={typed}
        className="journey-body mt-5 max-w-[27rem] font-serif text-[1.05rem] leading-[1.6] text-mist/90 md:text-[1.1rem]"
      />
      {!showItems && chapter.id === "questions" && <p className="sr-only">Questions I asked AI: {questionFragments.join(" ")}</p>}
      {showItems && chapter.items && (
        <ul className="mt-6 space-y-3 border-t border-mist/15 pt-5">
          {chapter.items.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-[0.45rem] block h-1.5 w-1.5 shrink-0 bg-surf" aria-hidden="true" />
              <div>
                <p className="font-pixel text-[0.95rem] text-mist">
                  {item.href ? (
                    <a href={item.href} className="underline decoration-surf underline-offset-4">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="mt-1 text-[0.95rem] leading-snug text-mist/65">{item.note}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Small serif label at the top-left of the frame during a chapter. */
export function ChapterLabel({ chapter }: { chapter: Chapter }) {
  return (
    <p className="font-serif text-[0.95rem] text-mist/75">
      Chapter {Number(chapter.number)} <span className="text-mist/40">·</span> {chapter.heading}
    </p>
  );
}

export function EndingPanel({ className, headingId = "ending-heading" }: { className?: string; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className={`scrim ${className ?? ""}`}>
      <p className={`journey-ending-label ${pixelLabel}`}>{ending.number} · The lighthouse</p>
      <h2 id={headingId} className={endingHeading}>
        {ending.heading}
      </h2>
      <p className="journey-ending-body mt-4 max-w-[27rem] text-[1.05rem] leading-[1.6] text-mist/90">{ending.body}</p>
      <nav aria-label="Links" className="journey-links mt-7 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
            className={`${link.phones === false ? "journey-link--desktop-only " : ""}inline-flex min-h-11 items-center gap-2 border border-mist/50 px-3 py-1.5 font-pixel text-[0.8rem] text-mist transition-colors hover:border-mist hover:bg-mist hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-poppy`}
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
      <p className={`journey-signature mt-8 ${pixelLabel}`}>{footer.signature}</p>
      <p className="mt-2 text-[0.8rem] leading-relaxed text-mist/45">{footer.line}</p>
    </section>
  );
}

/** A readable interlude, kept outside the moving scenery. */
export function QuestionPanel() {
  return (
    <div aria-label="Questions I asked AI" className="font-pixel text-[clamp(1.1rem,2.3vw,2rem)] leading-snug text-mist">
      {questionFragments.map((question) => <p key={question} className="max-w-[85%] py-8 even:ml-auto">{question}</p>)}
    </div>
  );
}
