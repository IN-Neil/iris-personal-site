"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, ending, intro } from "@/content/site";
import {
  activeSegment,
  clamp,
  fadeWindow,
  SCROLL_SCREENS,
  segmentOrder,
  segments,
  within,
  type SegmentKey,
} from "@/lib/journey";
import { ChapterPanel, EndingPanel, IntroPanel } from "./Panels";
import { Stage } from "./Stage";

/**
 * Desktop layout: one tall scroll container with a sticky, viewport-sized
 * stage inside it. Vertical scroll position becomes `progress` (0→1), which
 * drives the horizontal camera, zoom, time of day, and which panel is shown.
 */

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // Hidden on small screens; nothing to measure.
      if (element.offsetParent === null) return;
      const rect = element.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      setProgress(Math.min(1, Math.max(0, -rect.top / scrollable)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progress;
}

/** Fades a panel in and out and nudges it upward as it settles. */
function panelStyle(visibility: number): React.CSSProperties {
  return {
    opacity: visibility,
    transform: `translate3d(0, ${Math.round((1 - visibility) * 24)}px, 0)`,
    visibility: visibility <= 0.001 ? "hidden" : "visible",
  };
}

const routeLabels: Record<SegmentKey, string> = {
  intro: "Departure",
  questions: chapters[0].label,
  building: chapters[1].label,
  community: chapters[2].label,
  part: chapters[3].label,
  ending: ending.label,
};

function RouteMap({ progress }: { progress: number }) {
  const current = activeSegment(progress);
  const stops: SegmentKey[] = segmentOrder.filter((key) => key !== "intro");
  const currentIndex = stops.indexOf(current); // -1 while still on the intro

  return (
    <div className="pointer-events-none absolute bottom-6 left-8 flex items-center gap-4 font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-ivory/70">
      <ol className="flex items-center" aria-label="Chapters">
        {stops.map((key, i) => {
          const reached = i <= currentIndex;
          return (
            <li key={key} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="block h-px w-6 border-t border-dashed transition-colors"
                  style={{ borderColor: "var(--color-ivory)", opacity: reached ? 0.9 : 0.3 }}
                />
              )}
              <span
                aria-current={key === current ? "step" : undefined}
                className="block h-2.5 w-2.5 border transition-colors"
                style={{
                  borderColor: "var(--color-ivory)",
                  backgroundColor:
                    key === current ? "var(--color-poppy)" : reached ? "var(--color-ivory)" : "transparent",
                }}
              />
              <span className="sr-only">{routeLabels[key]}</span>
            </li>
          );
        })}
      </ol>
      <span aria-live="polite">
        {current === "intro"
          ? routeLabels.intro
          : `${currentIndex + 1} / ${stops.length} · ${routeLabels[current]}`}
      </span>
    </div>
  );
}

export function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const introVisible = fadeWindow(progress, segments.intro, 0.05);
  const endingVisible = fadeWindow(progress, segments.ending);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${SCROLL_SCREENS * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Stage progress={progress} className="absolute inset-0" />

        {/* Title, directly on the sky */}
        <div
          className="absolute left-[7%] top-[12%] w-[min(40rem,52vw)] transition-none"
          style={panelStyle(introVisible)}
        >
          <IntroPanel />
        </div>
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-ivory/70"
          style={{ opacity: introVisible }}
        >
          <span>{intro.scrollHint}</span>
          <span aria-hidden="true" className="scroll-hint block h-5 w-px bg-ivory/70" />
        </div>

        {/* Chapters */}
        {chapters.map((chapter) => {
          const segment = segments[chapter.id];
          const visibility = fadeWindow(progress, segment);
          // The question lands first; the heading and body follow a beat later.
          const reveal = clamp((within(progress, segment) - 0.12) / 0.14);
          // Chapter one is a close-up on the boat; its text sits beside it as a dialog.
          if (chapter.id === "questions") {
            return (
              <div
                key={chapter.id}
                className="absolute left-[50%] top-[54%] w-[min(24rem,32vw)]"
                style={panelStyle(visibility)}
              >
                <ChapterPanel chapter={chapter} reveal={reveal} dialog />
              </div>
            );
          }
          return (
            <div
              key={chapter.id}
              className="absolute inset-x-[8%] top-[9%]"
              style={panelStyle(visibility)}
            >
              <ChapterPanel chapter={chapter} reveal={reveal} centered />
            </div>
          );
        })}

        {/* Ending */}
        <div
          className="absolute left-[8%] top-[14%] w-[min(30rem,38vw)]"
          style={panelStyle(endingVisible)}
        >
          <EndingPanel />
        </div>

        {/* Small brand mark once the title has scrolled away */}
        <p
          className="pointer-events-none absolute left-8 top-6 font-pixel text-[0.6rem] uppercase tracking-[0.18em] text-ivory/70"
          style={{ opacity: 1 - introVisible }}
        >
          {intro.title} · {intro.subtitle}
        </p>

        <RouteMap progress={progress} />
      </div>
    </div>
  );
}
