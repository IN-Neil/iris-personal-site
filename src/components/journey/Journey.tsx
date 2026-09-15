"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, ending, intro } from "@/content/site";
import {
  activeSegment,
  chapterPhases,
  clamp,
  fadeWindow,
  SCROLL_SCREENS,
  storyProgress,
  segmentOrder,
  sceneState,
  segments,
  type SegmentKey,
} from "@/lib/journey";
import { ChapterLabel, ChapterPanel, EndingPanel, IntroPanel } from "./Panels";
import { Stage } from "./Stage";

/**
 * One tall scroll container with a sticky stage inside it, at every screen size.
 * Vertical scroll position becomes `progress` (0→1), which drives the horizontal
 * camera, zoom, time of day, and which panel is shown. Phone framing comes from
 * CSS (globals.css), so the first paint is already correct.
 */

/**
 * Progress is measured against a fixed travel track (the journey length minus one
 * stage, in `svh`), never the window's inner height: browser toolbars that grow and
 * shrink do not change it, so they cannot move the story. The container may grow past
 * the track on phones, where the ending keeps scrolling over the pinned lighthouse.
 */
function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  stageRef: React.RefObject<HTMLElement | null>,
  trackRef: React.RefObject<HTMLElement | null>,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!container || !stage || !track) return;

    const portrait = window.matchMedia("(orientation: portrait)");
    let wasPortrait = portrait.matches;
    let top = 0;
    let travel = 0;
    let stageHeight = 0;
    let latest = 0;
    let dirty = false;
    let frame = 0;

    const measure = () => {
      top = container.getBoundingClientRect().top + window.scrollY;
      travel = track.offsetHeight;
      stageHeight = stage.offsetHeight;
    };
    const remeasure = () => {
      const before = latest;
      measure();
      if (portrait.matches !== wasPortrait) {
        wasPortrait = portrait.matches;
        // Rotation changes the journey's length; keep the reader at the same moment.
        if (before > 0 && before < 1) {
          window.scrollTo({ top: top + before * travel, behavior: "instant" });
        }
      }
    };
    const update = () => {
      frame = 0;
      if (dirty || track.offsetHeight !== travel || stage.offsetHeight !== stageHeight) {
        dirty = false;
        remeasure();
      }
      latest = travel > 0 ? clamp((window.scrollY - top) / travel) : 0;
      setProgress(latest);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const invalidate = () => {
      dirty = true;
      schedule();
    };

    // Content above the journey, fonts, rotation and window size change layout;
    // toolbar collapse does not resize any of these, so it never re-measures.
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);
    observer.observe(stage);
    observer.observe(document.body);

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pageshow", invalidate);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pageshow", invalidate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [containerRef, stageRef, trackRef]);

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
    <div className="journey-route pointer-events-none absolute flex items-center gap-4 font-pixel text-[0.75rem] uppercase tracking-[0.12em] text-mist/70">
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
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(containerRef, stageRef, trackRef);
  const progress = storyProgress(scrollProgress);
  const introVisible = fadeWindow(progress, segments.intro, 0.05);
  const endingVisible = fadeWindow(progress, [0.94, 1], 0.035);

  return (
    <div
      ref={containerRef}
      data-journey="container"
      className="relative"
      // When browser controls collapse, the strip below the svh stage shows the foreground sea.
      style={{ minHeight: `${SCROLL_SCREENS * 100}svh`, backgroundColor: sceneState(progress).sea.fore }}
    >
      <div ref={stageRef} data-journey="stage" className="sticky top-0 h-svh w-full overflow-hidden">
        <Stage progress={progress} className="absolute inset-0" />

        {/* Title, directly on the sky */}
        <div data-journey="intro" className="journey-intro absolute transition-none" style={panelStyle(introVisible)}>
          <IntroPanel />
        </div>
        <div
          className="journey-hint pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-pixel text-[0.75rem] uppercase tracking-[0.12em] text-mist/70"
          style={{ opacity: introVisible }}
        >
          <span>{intro.scrollHint}</span>
          <span aria-hidden="true" className="scroll-hint block h-5 w-px bg-ivory/70" />
        </div>

        {/* Chapters: the words arrive last, placed wherever the scene has room (globals.css); the body types itself */}
        {chapters.map((chapter) => {
          const phases = chapterPhases(progress, segments[chapter.id]);
          return (
            <div
              key={chapter.id}
              data-chapter={chapter.id}
              className="journey-chapter pointer-events-none absolute inset-0"
              style={panelStyle(phases.visible)}
            >
              <div data-journey="copy" data-chapter={chapter.id} className="journey-copy absolute">
                <ChapterLabel chapter={chapter} />
                <ChapterPanel
                  chapter={chapter}
                  heading={phases.heading}
                  typed={phases.typed}
                  centered
                  className="journey-copy-panel mt-6"
                />
              </div>
            </div>
          );
        })}

        {/* Ending */}
        <div data-journey="ending" className="journey-ending absolute" style={panelStyle(endingVisible)}>
          <EndingPanel />
        </div>

        {/* Small brand mark once the title has scrolled away */}
        <p
          className="journey-brand pointer-events-none absolute font-pixel text-[0.75rem] uppercase tracking-[0.12em] text-mist/70"
          style={{ opacity: 1 - introVisible }}
        >
          {intro.title} · {intro.subtitle}
        </p>

        <RouteMap progress={progress} />
      </div>

      {/* The journey's travel: progress runs from its top to its bottom. */}
      <div ref={trackRef} data-journey="track" aria-hidden="true" style={{ height: `${(SCROLL_SCREENS - 1) * 100}svh` }} />

      {/*
        Phones and short landscape: the whole ending sits in the lighthouse scene. It rises
        into place at arrival and, when taller than the space above the boat, keeps
        scrolling up over the still-pinned scene (globals.css). Hidden elsewhere.
      */}
      <div
        data-journey="ending-scene"
        className="journey-ending-scene"
        style={{ opacity: endingVisible, visibility: endingVisible <= 0.001 ? "hidden" : "visible" }}
      >
        <EndingPanel headingId="ending-scene-heading" />
      </div>
    </div>
  );
}
