import type { CSSProperties, ReactNode } from "react";
import { chapters, questionFragments } from "@/content/site";
import {
  fadeWindow,
  keyframes,
  LAYER_SCREENS,
  layerShift,
  layerSize,
  mixColor,
  palette,
  round,
  sceneState,
  segments,
  worldX,
} from "@/lib/journey";
import {
  Bird,
  Bolt,
  Cabin,
  Cloud,
  Hands,
  Lighthouse,
  Moon,
  PaperBoat,
  Shore,
  waveDataUri,
} from "./sprites";

/**
 * The world, drawn for a single `progress` value.
 *
 * Layers are ordered back to front. Each parallax layer is several stage
 * widths wide and slides left by `progress × factor`. Things that should stay
 * put on screen (moon, boat, rain) live directly in the stage instead.
 */

const HORIZON = 58; // % of stage height
const WATERLINE = HORIZON + 25; // where the boat floats

const SKY = 0.12;
const FAR = 0.22;
const MID = 0.45;
const NEAR = 0.75;
const FORE = 1;

type LayerProps = {
  progress: number;
  factor: number;
  children: ReactNode;
};

function Layer({ progress, factor, children }: LayerProps) {
  return (
    <div
      className="absolute inset-y-0 left-0 will-change-transform"
      style={{
        width: `${LAYER_SCREENS * 100}%`,
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
  foam: number;
  period: number;
  crest: number;
  duration: number;
  reverse?: boolean;
};

function SeaBand({ top, color, energy, foam, period, crest, duration, reverse }: SeaBandProps) {
  return (
    <div className="absolute inset-x-0 -bottom-[40%]" style={{ top: `${top}%`, backgroundColor: color }}>
      <div
        className="sea-crest absolute inset-x-0"
        style={{
          top: -crest,
          height: crest,
          backgroundImage: waveDataUri(color, foam),
          backgroundSize: `${period}px ${crest}px`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "0 0",
          transform: `scaleY(${round(energy)})`,
          transformOrigin: "bottom",
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      />
    </div>
  );
}

// Deterministic star field so server and client render the same sky.
const stars = Array.from({ length: 90 }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const frac = (n: number) => n - Math.floor(n);
  return {
    x: round(frac(seed) * 100),
    y: round(frac(seed * 1.7) * 50 + 1),
    size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
    delay: round(frac(seed * 2.3) * 4),
  };
});

const birds = [
  { at: 0.17, vx: 0.18, top: 24 },
  { at: 0.19, vx: 0.23, top: 21 },
  { at: 0.2, vx: 0.2, top: 27 },
];

const fragments = questionFragments.map((text, i) => ({
  text,
  at: 0.14 + i * 0.03,
  // Placed for the chapter-one close-up: upper left of the boat, clear of the dialog.
  vx: [0.05, 0.3, 0.12, 0.36, 0.2][i % 5],
  top: [30, 40, 50, 34, 46][i % 5],
}));

// Clouds gather from chapter two through the storm, then thin out.
const clouds = [
  { at: 0.34, vx: 0.15, top: 6, w: 22 },
  { at: 0.38, vx: 0.55, top: 3, w: 30 },
  { at: 0.44, vx: 0.85, top: 10, w: 18 },
  { at: 0.52, vx: 0.3, top: 4, w: 26 },
  { at: 0.58, vx: 0.75, top: 8, w: 20 },
  { at: 0.66, vx: 0.1, top: 2, w: 34 },
  { at: 0.7, vx: 0.5, top: 7, w: 40 },
  { at: 0.74, vx: 0.9, top: 1, w: 30 },
  { at: 0.8, vx: 0.35, top: 5, w: 28 },
  { at: 0.9, vx: 0.7, top: 3, w: 18 },
];

const distantLights = [0.5, 0.58, 0.66, 0.82, 0.9];

// Chapter milestones drift past as small markers in the world instead of a list.
const markers = chapters.flatMap((chapter) => {
  const [start, end] = segments[chapter.id];
  const items = chapter.items ?? [];
  return items.map((item, i) => ({
    id: chapter.id,
    text: item.title,
    at: start + ((i + 1) / (items.length + 1)) * (end - start),
    vx: [0.12, 0.4, 0.22, 0.48][i % 4],
    top: [34, 22, 44, 28][i % 4],
  }));
});

const boatXStops = [
  [0, 22],
  [0.05, 22],
  [0.17, 31],
  [0.84, 31],
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
  const boatWidth = compact ? 20 : 10;
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
        style={{ transform: `scale(${s.zoom})`, transformOrigin: `${s.origin[0]}% ${s.origin[1]}%` }}
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

        {/* Moon, and its reflection on the far water */}
        <Moon
          className="absolute"
          style={{
            left: compact ? "62%" : "80%",
            top: compact ? "20%" : "9%",
            width: compact ? "11%" : "5.5%",
            opacity: s.moonOpacity,
          }}
        />
        <div
          className="moonlight absolute"
          style={{
            left: compact ? "63%" : "81%",
            top: `${HORIZON + 0.5}%`,
            width: compact ? "9%" : "3.5%",
            height: "16%",
            opacity: round(s.moonOpacity * 0.3),
          }}
        />

        {/* Horizon haze (wider than the stage so the pull-back never shows its edges) */}
        <div
          className="absolute -inset-x-[20%]"
          style={{
            top: `${HORIZON - 12}%`,
            height: "12%",
            background: `linear-gradient(to bottom, transparent, ${mixColor(s.sky, s.sea.far, 0.5)})`,
          }}
        />

        {/* Clouds */}
        <Layer progress={s.progress} factor={SKY}>
          {clouds.map((cloud, i) => (
            <Cloud
              key={i}
              fill={s.cloud}
              className="absolute"
              style={{
                left: `${worldX(cloud.at, cloud.vx, SKY)}%`,
                top: `${cloud.top}%`,
                width: layerSize(compact ? cloud.w * 1.6 : cloud.w),
                opacity: round(fadeWindow(s.progress, [cloud.at - 0.1, 2], 0.1) * s.cloudCover),
              }}
            />
          ))}
        </Layer>

        {/* Far layer: far sea, birds, distant lights, shores, lighthouse */}
        <Layer progress={s.progress} factor={FAR}>
          <SeaBand
            top={HORIZON}
            color={s.sea.far}
            energy={s.energy * 0.6}
            foam={s.sea.foam * 0.4}
            period={48}
            crest={8}
            duration={26}
          />

          {/* Departure shore, on the left at the start */}
          <div
            className="absolute left-0"
            style={{ width: `${worldX(0, 0.2, FAR)}%`, top: `${HORIZON - 5}%`, height: "10%" }}
          >
            <Shore fill={s.shore} className="block h-full w-full -scale-x-100" />
          </div>

          {birds.map((bird, i) => (
            <Bird
              key={i}
              className="absolute"
              style={{
                left: `${worldX(bird.at, bird.vx, FAR)}%`,
                top: `${bird.top}%`,
                width: layerSize(compact ? 3 : 1.3),
                opacity: 0.45,
              }}
            />
          ))}

          {distantLights.map((vx, i) => (
            <span
              key={i}
              className="star absolute"
              style={{
                left: `${worldX(0.57, vx, FAR)}%`,
                top: `${HORIZON - 1.4}%`,
                width: 6,
                height: 4,
                backgroundColor: palette.peach,
                boxShadow: `0 0 10px 3px ${palette.peach}99`,
                opacity: round(s.distantLights * 0.9),
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}

          <div
            className="absolute"
            style={{
              left: `${worldX(0.73, 0.42, FAR)}%`,
              top: "4%",
              height: "34%",
              aspectRatio: "6 / 20",
              opacity: s.lightning,
            }}
          >
            <Bolt className="bolt block h-full w-full" />
          </div>

          {/* Arrival shore with the lighthouse and keeper's cabin */}
          <div
            className="absolute"
            style={{
              left: `${worldX(1, 0.55, FAR)}%`,
              width: layerSize(75),
              top: `${HORIZON - 11}%`,
              height: "16%",
            }}
          >
            <Shore fill={s.shore} className="block h-full w-full" />
          </div>
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
                opacity: round(s.beam * 0.6),
                background: `linear-gradient(to right, ${palette.ivory}cc, ${palette.ivory}00)`,
              }}
            />
            <Lighthouse lit={s.beam} className="block h-full w-full" />
          </div>
          <Cabin
            lit={1}
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
          <SeaBand
            top={HORIZON + 10}
            color={s.sea.mid}
            energy={s.energy * 0.85}
            foam={s.sea.foam * 0.7}
            period={72}
            crest={12}
            duration={18}
            reverse
          />
        </Layer>

        {/* Near sea and floating question fragments */}
        <Layer progress={s.progress} factor={NEAR}>
          <SeaBand
            top={HORIZON + 23}
            color={s.sea.near}
            energy={s.energy * 0.8}
            foam={s.sea.foam}
            period={96}
            crest={14}
            duration={13}
          />
          {markers.map((marker, i) => (
            <span
              key={`${marker.id}-${i}`}
              className="absolute flex items-center gap-2 whitespace-nowrap font-pixel text-[0.6rem] tracking-wide text-ivory md:text-[0.7rem]"
              style={{
                left: `${worldX(marker.at, marker.vx, NEAR)}%`,
                top: `${marker.top}%`,
                opacity: round(fadeWindow(s.progress, segments[marker.id], 0.05) * 0.85),
              }}
            >
              <span className="block h-1.5 w-1.5 bg-surf" />
              {marker.text}
            </span>
          ))}
          {fragments.map((fragment, i) => (
            <span
              key={i}
              className="fragment absolute font-pixel text-[0.6rem] tracking-wide text-ivory md:text-[0.7rem]"
              style={{
                left: `${worldX(fragment.at, fragment.vx, NEAR)}%`,
                top: `${fragment.top}%`,
                opacity: round(s.fragments * (s.progress < questionsEnd ? 0.75 : 0.4)),
                animationDelay: `${i * 1.3}s`,
              }}
            >
              {fragment.text}
            </span>
          ))}
        </Layer>

        {/* The paper boat, the hands that launch it, and the gust that takes it */}
        <div
          className="absolute"
          style={{
            left: `${boatX}%`,
            top: `${WATERLINE + s.boatLift}%`,
            width: `${boatWidth}%`,
            transform: "translateY(-100%)",
          }}
        >
          <div
            className="absolute"
            style={{
              width: "320%",
              left: "-145%",
              top: "13%",
              opacity: s.hands,
              transform: `translate3d(${-(1 - s.hands) * 30}%, ${(1 - s.hands) * 40}%, 0)`,
            }}
          >
            <Hands className="block w-full" />
          </div>
          <div
            className="absolute rounded-full"
            style={{
              left: "50%",
              top: "70%",
              width: "60%",
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${palette.peach}66 0%, ${palette.peach}00 70%)`,
              opacity: s.boatGlow,
            }}
          />
          <div className="boat">
            <PaperBoat glow={s.boatGlow} className="block w-full" />
          </div>
          <div className="absolute inset-0" style={{ opacity: round(s.wind * 0.55) }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="wind absolute h-px bg-ivory"
                style={{
                  left: `${-70 + i * 18}%`,
                  top: `${18 + i * 20}%`,
                  width: `${40 - i * 8}%`,
                  animationDelay: `${i * 0.35}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Foreground sea */}
        <Layer progress={s.progress} factor={FORE}>
          <SeaBand
            top={HORIZON + 32}
            color={s.sea.fore}
            energy={s.energy * 1.1}
            foam={s.sea.foam * 0.5}
            period={128}
            crest={18}
            duration={10}
            reverse
          />
        </Layer>
      </div>

      {/* Rain and lightning sit on top of the camera, like weather on a lens */}
      <div className="rain pointer-events-none absolute inset-0" style={{ opacity: round(s.rain * 0.3) }} />
      <div className="pointer-events-none absolute inset-0" style={{ opacity: s.lightning }}>
        <div className="flash absolute inset-0 bg-ivory" />
      </div>

      {/* Paper grain */}
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}
