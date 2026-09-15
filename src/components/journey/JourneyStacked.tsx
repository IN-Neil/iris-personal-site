import { chapters } from "@/content/site";
import { midpoint, segments } from "@/lib/journey";
import { ChapterPanel, EndingPanel, IntroPanel, QuestionPanel } from "./Panels";
import { Stage } from "./Stage";

/**
 * Former mobile layout: the same story, stacked vertically. Each chapter gets a
 * frozen frame of the world at that chapter's moment in the journey.
 *
 * No longer mounted (see page.tsx). Kept for reference and content parity until
 * the reading presentation replaces it (mobile journey brief, Phase 3).
 */

function Frame({ progress, tall = false }: { progress: number; tall?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden border-y border-ivory/10 ${tall ? "h-[max(46rem,100svh)]" : "aspect-[4/3]"}`}
    >
      <Stage progress={progress} examples={false} className="absolute inset-0" />
    </div>
  );
}

export function JourneyStacked() {
  return (
    <div className="overflow-x-clip bg-night">
      <div className="relative">
        <Frame progress={0} tall />
        <div className="absolute inset-x-0 top-0 px-6 pt-24">
          <IntroPanel />
        </div>
      </div>

      {chapters.map((chapter) => (
        <article key={chapter.id} className="mt-10">
          <Frame progress={midpoint(segments[chapter.id])} />
          <div className="px-5 py-8">
            <ChapterPanel chapter={chapter} showItems idPrefix="mobile-" />
            {chapter.id === "questions" && <div className="mt-12"><QuestionPanel /></div>}
          </div>
        </article>
      ))}

      <article className="mt-24">
        <Frame progress={1} />
        <div className="px-5 pb-12 pt-8">
          <EndingPanel headingId="mobile-ending-heading" />
        </div>
      </article>
    </div>
  );
}
