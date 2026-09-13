"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, ending, intro } from "@/content/site";
import {
  activeSegment,
  fadeWindow,
  mixColor,
  palette,
  sceneState,
  SCROLL_SCREENS,
  segmentOrder,
  segments,
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
    transform: `translate3d(0, ${(1 - visibility) * 24}px, 0)`,
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
    <div className="pointer-events-none absolute bottom-6 left-8 flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--ui)]">
      <ol className="flex items-center" aria-label="Chapters">
        {stops.map((key, i) => {
          const reached = i <= currentIndex;
          return (
            <li key={key} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="block h-px w-6 border-t border-dashed transition-colors"
                  style={{ borderColor: "var(--ui)", opacity: reached ? 1 : 0.35 }}
                />
              )}
              <span
                aria-current={key === current ? "step" : undefined}
                className="block h-2.5 w-2.5 border transition-colors"
                style={{
                  borderColor: "var(--ui)",
                  backgroundColor:
                    key === current ? "var(--color-poppy)" : reached ? "var(--ui)" : "transparent",
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
  const ui = mixColor(palette.ink, palette.ivory, sceneState(progress).night);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${SCROLL_SCREENS * 100}vh` }}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ "--ui": ui } as React.CSSProperties}
      >
        <Stage progress={progress} className="absolute inset-0" />

        {/* Title, directly on the sky */}
        <div
          className="absolute left-[7%] top-[12%] w-[min(40rem,52vw)] transition-none"
          style={panelStyle(introVisible)}
        >
          <IntroPanel />
        </div>
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/80"
          style={{ opacity: introVisible }}
        >
          <span>{intro.scrollHint}</span>
          <span aria-hidden="true" className="scroll-hint block h-5 w-px bg-ink/70" />
        </div>

        {/* Chapters */}
        {chapters.map((chapter) => {
          const visibility = fadeWindow(progress, segments[chapter.id]);
          return (
            <div
              key={chapter.id}
              className="absolute right-[6%] top-1/2 w-[min(31rem,42vw)] -translate-y-1/2"
              style={{
                ...panelStyle(visibility),
                transform: `translate3d(0, calc(-50% + ${(1 - visibility) * 24}px), 0)`,
              }}
            >
              <ChapterPanel chapter={chapter} />
            </div>
          );
        })}

        {/* Ending */}
        <div
          className="absolute left-[6%] top-1/2 w-[min(33rem,42vw)]"
          style={{
            ...panelStyle(endingVisible),
            transform: `translate3d(0, calc(-50% + ${(1 - endingVisible) * 24}px), 0)`,
          }}
        >
          <EndingPanel />
        </div>

        {/* Small brand mark once the title has scrolled away */}
        <p
          className="pointer-events-none absolute left-8 top-6 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--ui)]"
          style={{ opacity: 1 - introVisible }}
        >
          {intro.title} · {intro.subtitle}
        </p>

        <RouteMap progress={progress} />
      </div>
    </div>
  );
}
