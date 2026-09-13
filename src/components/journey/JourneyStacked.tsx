import { chapters } from "@/content/site";
import { midpoint, segments } from "@/lib/journey";
import { ChapterPanel, EndingPanel, IntroPanel } from "./Panels";
import { Stage } from "./Stage";

/**
 * Mobile layout: the same story, stacked vertically. Each chapter gets a
 * frozen frame of the world at that chapter's moment in the journey.
 */

function Frame({ progress, tall = false }: { progress: number; tall?: boolean }) {
  return (
    <div
      className={`relative w-full overflow-hidden border-y border-ivory/10 ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
    >
      <Stage progress={progress} compact className="absolute inset-0" />
    </div>
  );
}

export function JourneyStacked() {
  return (
    <div className="bg-night">
      <div className="relative">
        <Frame progress={0.02} tall />
        <div className="absolute inset-x-0 top-0 px-6 pt-10">
          <IntroPanel />
        </div>
      </div>

      {chapters.map((chapter) => (
        <article key={chapter.id} className="mt-10">
          <Frame progress={midpoint(segments[chapter.id])} />
          <div className="px-5 py-8">
            <ChapterPanel chapter={chapter} showItems />
          </div>
        </article>
      ))}

      <article className="mt-6">
        <Frame progress={1} />
        <div className="px-5 pb-12 pt-8">
          <EndingPanel />
        </div>
      </article>
    </div>
  );
}
