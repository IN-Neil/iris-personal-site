import type { CSSProperties, ReactNode } from "react";
import { questionFragments } from "@/content/site";
import {
  keyframes,
  layerShift,
  mixColor,
  palette,
  sceneState,
  segments,
  worldX,
  WORLD_SCREENS,
} from "@/lib/journey";
import { Bird, Boat, Cabin, Lighthouse, Moon, Shore, Sun, waveDataUri } from "./sprites";

/**
 * The world, drawn for a single `progress` value.
 *
 * Layers are ordered back to front. Each parallax layer is WORLD_SCREENS wide
 * and slides left by `progress × factor`. Things that should stay put on
 * screen (sun, moon, boat) live directly in the stage instead of in a layer.
 */

const HORIZON = 58; // % of stage height

const FAR = 0.22;
const MID = 0.45;
const NEAR = 0.75;
const FORE = 1;

type LayerProps = {
  progress: number;
  factor: number;
  children: ReactNode;
  className?: string;
};

function Layer({ progress, factor, children, className }: LayerProps) {
  return (
    <div
      className={`absolute inset-y-0 left-0 will-change-transform ${className ?? ""}`}
      style={{
        width: `${WORLD_SCREENS * 100}%`,
        transform: `translate3d(${layerShift(progress, factor)}%, 0, 0)`,
      }}
    >
      {children}
    </div>
  );
}

type SeaBandProps = {
  top: number;
  color: string;
  energy: number;
  period: number;
  crest: number;
  duration: number;
  reverse?: boolean;
};

function SeaBand({ top, color, energy, period, crest, duration, reverse }: SeaBandProps) {
  return (
    <div className="absolute inset-x-0 bottom-0" style={{ top: `${top}%`, backgroundColor: color }}>
      <div
        className="sea-crest absolute inset-x-0"
        style={{
          top: -crest,
          height: crest,
          backgroundImage: waveDataUri(color),
          backgroundSize: `${period}px ${crest}px`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 0",
          transform: `scaleY(${energy})`,
          transformOrigin: "bottom",
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      />
    </div>
  );
}

// Deterministic star field so server and client render the same sky.
const stars = Array.from({ length: 70 }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const frac = (n: number) => n - Math.floor(n);
  return {
    x: frac(seed) * 100,
    y: frac(seed * 1.7) * 48 + 2,
    size: i % 7 === 0 ? 3 : 2,
    delay: frac(seed * 2.3) * 4,
  };
});

const birds = [
  { at: 0.17, vx: 0.18, top: 24 },
  { at: 0.19, vx: 0.23, top: 21 },
  { at: 0.2, vx: 0.2, top: 27 },
  { at: 0.55, vx: 0.72, top: 30 },
  { at: 0.56, vx: 0.78, top: 27 },
];

const fragments = questionFragments.map((text, i) => ({
  text,
  at: 0.14 + i * 0.03,
  vx: [0.08, 0.36, 0.14, 0.42, 0.24][i % 5],
  top: [24, 15, 40, 30, 47][i % 5],
}));

const distantLights = [0.5, 0.58, 0.66, 0.82, 0.9];

const boatXStops = [
  [0, 30],
  [0.84, 30],
  [1, 50],
] as const;

export type StageProps = {
  progress: number;
  /** Larger sprites for small, stacked scenes on mobile. */
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Stage({ progress, compact = false, className, style }: StageProps) {
  const s = sceneState(progress);
  const boatX = keyframes(s.progress, boatXStops);
  const [, questionsEnd] = segments.questions;
  const inkOnSky = mixColor(palette.ink, palette.ivory, s.night);

  const boatWidth = compact ? 24 : 13;
  const lighthouseHeight = compact ? 34 : 30;
  const lighthouseLeft = worldX(1, 0.76, FAR);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: s.sky, containerType: "size", ...style }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `scale(${s.zoom})`, transformOrigin: `50% ${HORIZON + 6}%` }}
      >
        {/* Stars */}
        <Layer progress={s.progress} factor={0.05}>
          {stars.map((star, i) => (
            <span
              key={i}
              className="star absolute bg-ivory"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                opacity: s.starOpacity,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </Layer>

        {/* Sun and moon stay on screen; the sun sinks as the day goes on. */}
        <Sun
          className="absolute"
          style={{
            left: "14%",
            top: `${s.sunY}%`,
            width: compact ? "9%" : "4.5%",
            opacity: s.sunOpacity,
          }}
        />
        <Moon
          className="absolute"
          style={{
            left: "68%",
            top: "9%",
            width: compact ? "9%" : "4.2%",
            opacity: s.moonOpacity,
          }}
        />

        {/* Horizon haze */}
        <div
          className="absolute inset-x-0"
          style={{
            top: `${HORIZON - 14}%`,
            height: "14%",
            background: `linear-gradient(to bottom, transparent, ${mixColor(s.sky, s.sea.far, 0.55)})`,
          }}
        />

        {/* Far layer: far sea, birds, distant lights, shore, lighthouse */}
        <Layer progress={s.progress} factor={FAR}>
          <SeaBand top={HORIZON} color={s.sea.far} energy={s.energy * 0.6} period={48} crest={8} duration={26} />

          {birds.map((bird, i) => (
            <Bird
              key={i}
              className="absolute"
              style={{
                left: `${worldX(bird.at, bird.vx, FAR)}%`,
                top: `${bird.top}%`,
                width: compact ? "3%" : "1.1%",
                opacity: 0.8 - s.night * 0.6,
              }}
            />
          ))}

          {distantLights.map((vx, i) => (
            <span
              key={i}
              className="star absolute rounded-none"
              style={{
                left: `${worldX(0.57, vx, FAR)}%`,
                top: `${HORIZON - 1.2}%`,
                width: 4,
                height: 3,
                backgroundColor: palette.peach,
                opacity: s.distantLights * 0.9,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}

          <Shore
            fill={s.shore}
            className="absolute"
            style={{
              left: `${worldX(1, 0.6, FAR)}%`,
              right: 0,
              top: `${HORIZON - 12}%`,
              height: "18%",
            }}
          />
          <div
            className="absolute"
            style={{
              left: `${lighthouseLeft}%`,
              top: `${HORIZON - 4 - lighthouseHeight}%`,
              height: `${lighthouseHeight}%`,
              aspectRatio: "24 / 46",
            }}
          >
            <div
              className="beam absolute"
              style={{
                left: "50%",
                top: "23%",
                width: compact ? "70cqw" : "44cqw",
                height: "8cqh",
                opacity: s.beam * 0.65,
                background: `linear-gradient(to right, ${palette.ivory}cc, ${palette.ivory}00)`,
              }}
            />
            <Lighthouse lit={s.beam} className="block h-full w-full" />
          </div>
          <Cabin
            lit={s.night}
            className="absolute"
            style={{
              left: `${worldX(1, 0.86, FAR)}%`,
              top: `${HORIZON - 3 - (compact ? 9 : 7)}%`,
              height: compact ? "9%" : "7%",
            }}
          />
        </Layer>

        {/* Mid sea */}
        <Layer progress={s.progress} factor={MID}>
          <SeaBand top={HORIZON + 10} color={s.sea.mid} energy={s.energy * 0.85} period={72} crest={12} duration={18} reverse />
        </Layer>

        {/* The boat */}
        <div
          className="boat absolute"
          style={{
            left: `${boatX}%`,
            top: `${HORIZON + 24}%`,
            width: `${boatWidth}%`,
            transform: "translateY(-100%)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              right: "2%",
              top: "28%",
              width: "26%",
              aspectRatio: "1",
              transform: "translate(30%, -40%)",
              background: `radial-gradient(circle, ${palette.peach}aa 0%, ${palette.peach}00 70%)`,
              opacity: s.lantern * (0.35 + s.night * 0.65),
            }}
          />
          <Boat lantern={s.lantern} className="block w-full" />
        </div>

        {/* Near sea and floating question fragments */}
        <Layer progress={s.progress} factor={NEAR}>
          <SeaBand top={HORIZON + 21} color={s.sea.near} energy={s.energy} period={96} crest={14} duration={13} />
          {fragments.map((fragment, i) => (
            <span
              key={i}
              className="fragment absolute font-mono text-[0.72rem] tracking-wide md:text-sm"
              style={{
                left: `${worldX(fragment.at, fragment.vx, NEAR)}%`,
                top: `${fragment.top}%`,
                color: inkOnSky,
                opacity: s.fragments * (s.progress < questionsEnd ? 0.7 : 0.4),
                animationDelay: `${i * 1.3}s`,
              }}
            >
              {fragment.text}
            </span>
          ))}
        </Layer>

        {/* Foreground sea */}
        <Layer progress={s.progress} factor={FORE}>
          <SeaBand top={HORIZON + 32} color={s.sea.fore} energy={s.energy * 1.1} period={128} crest={18} duration={10} reverse />
        </Layer>
      </div>

      {/* Paper grain */}
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
