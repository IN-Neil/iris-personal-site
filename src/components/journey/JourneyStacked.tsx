"use client";

import { useEffect, useRef } from "react";
import { chapters } from "@/content/site";
import { midpoint, segments } from "@/lib/journey";
import { ChapterPanel, EndingPanel, IntroPanel, QuestionPanel } from "./Panels";
import { Stage } from "./Stage";

/**
 * Mobile layout: the same story, stacked vertically. Each chapter gets a
 * fixed frame of the world at that chapter's moment in the journey, with
 * the boat sailing across each illustration as it passes through the viewport.
 */

function Frame({ progress, tall = false }: { progress: number; tall?: boolean }) {
  return (
    <div
      data-mobile-sailing-frame={tall ? "intro" : "chapter"}
      className={`relative w-full overflow-hidden border-y border-ivory/10 ${tall ? "h-[max(46rem,100svh)]" : "aspect-[4/3]"}`}
    >
      <Stage progress={progress} compact className="absolute inset-0" />
    </div>
  );
}

export function JourneyStacked() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const frames = Array.from(root.querySelectorAll<HTMLElement>("[data-mobile-sailing-frame]"));
    const enabled = window.matchMedia("(max-width: 767px) and (prefers-reduced-motion: no-preference)");
    let pending = 0;
    const update = () => {
      pending = 0;
      if (!enabled.matches) {
        frames.forEach((frame) => frame.style.removeProperty("--mobile-boat-x"));
        return;
      }
      const viewport = document.documentElement.clientHeight;
      // Read geometry together before writing styles. Only the boat moves;
      // the camera pivot and chapter artwork stay at their original positions.
      const positions = frames.map((frame) => {
        const { top, height } = frame.getBoundingClientRect();
        const travel = frame.dataset.mobileSailingFrame === "intro"
          ? -top / (height * 0.85)
          : (viewport - top) / (viewport + height);
        return -35 + Math.min(1, Math.max(0, travel)) * 145;
      });
      frames.forEach((frame, index) => {
        frame.style.setProperty("--mobile-boat-x", `${positions[index].toFixed(3)}%`);
      });
    };
    const schedule = () => {
      if (!pending) pending = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    enabled.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(pending);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      enabled.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div ref={rootRef} className="overflow-x-clip bg-night">
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
