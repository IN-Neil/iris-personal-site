import type { CSSProperties, ReactNode } from "react";
import { chapters, questionFragments } from "@/content/site";
import {
  chapterPhases,
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
import { Bird, Bolt, Pixel, Star, waveDataUri } from "./sprites";

/**
 * The world, drawn for a single `progress` value.
 *
 * One continuous board, seen from a fixed camera close to the water. Layers
 * are ordered back to front; each parallax layer is several stage widths wide
 * and slides left by `progress × factor`, so the drawn sprites drift past at
 * different speeds. Things that stay on screen (moon, boat, rain) live
 * directly in the stage instead.
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

// Questions surface one at a time after the hands let go; the last one lingers.
const fragments = questionFragments.map((text, i) => ({
  text,
  at: 0.11 + i * 0.02,
  appear: 0.085 + i * 0.02,
  vx: [0.16, 0.46, 0.28, 0.6, 0.38][i % 5],
  top: [22, 34, 44, 28, 40][i % 5],
}));

// Cloud banks drift through the sky layer. One hangs top-left at departure,
// a big one gathers under the moon in chapter two, the rest are the storm.
const clouds = [
  { at: 0.02, vx: 0.04, top: -2, w: 36 },
  { at: 0.2, vx: 0.6, top: -6, w: 30 },
  { at: 0.36, vx: 0.06, top: 30, w: 50 },
  { at: 0.42, vx: 0.7, top: 2, w: 28 },
  { at: 0.52, vx: 0.3, top: 4, w: 42 },
  { at: 0.6, vx: 0.75, top: -2, w: 46 },
  { at: 0.68, vx: 0.1, top: 6, w: 52 },
  { at: 0.72, vx: 0.55, top: -4, w: 44 },
  { at: 0.78, vx: 0.9, top: 8, w: 38 },
  { at: 0.9, vx: 0.4, top: 0, w: 30 },
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
    // Left-of-centre sky, under the moon and clear of the text on the right.
    vx: [0.1, 0.3, 0.18, 0.36][i % 4],
    top: [40, 33, 47, 29][i % 4],
  }));
});

// The boat is held over the end of the dock, then drifts a little to the left
// of frame and stays there until the lighthouse pulls it right.
const boatXStops = [
  [0, 34],
  [0.05, 34],
  [0.16, 28],
  [0.84, 28],
  [1, 44],
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
  const boatWidth = compact ? 30 : 18;
  const [moonX, moonY, moonWidth] = s.moon;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: s.sky, containerType: "size", ...style }}
      aria-hidden="true"
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

      {/* The moon: small and distant at departure, rising and swelling into chapter two */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${moonX}%`,
          top: `${moonY}%`,
          width: `${compact ? moonWidth * 1.5 : moonWidth}%`,
          opacity: s.moonOpacity,
        }}
      >
        <Pixel name="moon" priority />
      </div>
      <div
        className="moonlight absolute -translate-x-1/2"
        style={{
          left: `${moonX}%`,
          top: `${HORIZON + 0.5}%`,
          width: `${round(moonWidth * 0.6)}%`,
          height: "16%",
          opacity: round(s.moonOpacity * 0.25),
        }}
      />

      {/* Horizon haze (wider than the stage so it never shows its edges) */}
      <div
        className="absolute -inset-x-[20%]"
        style={{
          top: `${HORIZON - 12}%`,
          height: "12%",
          background: `linear-gradient(to bottom, transparent, ${mixColor(s.sky, s.sea.far, 0.5)})`,
        }}
      />

      {/* Clouds, and the questions of chapter one drifting slowly with them */}
      <Layer progress={s.progress} factor={SKY}>
        {fragments.map((fragment, i) => (
          <span
            key={i}
            className="fragment absolute font-pixel text-[0.6rem] tracking-wide text-ivory md:text-[0.7rem]"
            style={{
              left: `${worldX(fragment.at, fragment.vx, SKY)}%`,
              top: `${fragment.top}%`,
              opacity: round(s.fragments * fadeWindow(s.progress, [fragment.appear, 2], 0.02) * 0.8),
              animationDelay: `${i * 1.3}s`,
            }}
          >
            {fragment.text}
          </span>
        ))}
        {clouds.map((cloud, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${worldX(cloud.at, cloud.vx, SKY)}%`,
              top: `${cloud.top}%`,
              width: layerSize(compact ? cloud.w * 1.6 : cloud.w),
              opacity: round(fadeWindow(s.progress, [cloud.at - 0.12, 2], 0.1) * s.cloudCover),
              // Storm clouds darken; the tint is a slate wash over the drawn bank.
              filter: `brightness(${round(1 - s.storm * 0.45)})`,
            }}
          >
            <Pixel name="cloudBank" priority={i === 0} />
          </div>
        ))}
      </Layer>

      {/* Far layer: far sea, birds, distant lights, the arrival shore and lighthouse */}
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

        {/* Arrival: cliffs, the lighthouse and the keeper's cabin, all grounded on the horizon */}
        <div
          className="absolute -translate-y-full"
          style={{ left: `${worldX(1, 0.48, FAR)}%`, top: `${HORIZON + 3}%`, width: layerSize(compact ? 110 : 75) }}
        >
          <Pixel name="shoreCliffs" />
        </div>
        <div
          className="absolute -translate-y-full"
          style={{ left: `${worldX(1, 0.74, FAR)}%`, top: `${HORIZON - 3}%`, width: compact ? "13cqh" : "9.5cqh" }}
        >
          <div
            className="beam absolute"
            style={{
              left: "50%",
              top: "16%",
              width: compact ? "70cqw" : "44cqw",
              height: "6cqh",
              opacity: round(s.beam * 0.6),
              background: `linear-gradient(to right, ${palette.ivory}cc, ${palette.ivory}00)`,
            }}
          />
          <Pixel name="lighthouse" />
        </div>
        <div
          className="absolute -translate-y-full"
          style={{ left: `${worldX(1, 0.86, FAR)}%`, top: `${HORIZON - 1.5}%`, width: layerSize(compact ? 12 : 8) }}
        >
          <Pixel name="cabin" />
        </div>
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

      {/* Near sea, the departure dock, and the milestone markers */}
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
        {/* Only the end of the dock shows; the hill behind it is already off to the left */}
        <div
          className="absolute -translate-y-full"
          style={{
            left: `${worldX(0, compact ? -1.25 : -0.86, NEAR)}%`,
            top: `${WATERLINE + 5}%`,
            width: layerSize(compact ? 160 : 118),
          }}
        >
          <Pixel name="shoreDock" priority />
        </div>
        {markers.map((marker, i) => {
          const [start, end] = segments[marker.id];
          const settled = chapterPhases(s.progress, segments[marker.id]).settled;
          return (
            <span
              key={`${marker.id}-${i}`}
              className="absolute flex items-center gap-2.5 whitespace-nowrap font-pixel text-[0.62rem] tracking-wide text-ivory md:text-[0.72rem]"
              style={{
                left: `${worldX(marker.at, marker.vx, NEAR)}%`,
                top: `${marker.top}%`,
                opacity: round(fadeWindow(s.progress, [start + 0.02 * (end - start), end], 0.04) * (0.95 - settled * 0.45)),
              }}
            >
              <Star className="star block" style={{ width: compact ? 14 : 11, animationDelay: `${i * 0.6}s` }} />
              {marker.text}
            </span>
          );
        })}
      </Layer>

      {/* The paper boat, the hands that launch it, and the gust that takes it.
          The wrapper is a size container so the hands can be measured in boat widths (cqw). */}
      <div
        className="absolute -translate-y-full"
        style={{
          left: `${boatX}%`,
          top: `${WATERLINE + s.boatLift}%`,
          width: `${boatWidth}%`,
          aspectRatio: "832 / 274",
          containerType: "size",
        }}
      >
        <div
          className="absolute"
          style={{
            width: "260cqw",
            left: "-111cqw",
            top: "-45cqw",
            opacity: s.hands,
            transform: `translate3d(${-(1 - s.hands) * 45}%, ${-(1 - s.hands) * 12}%, 0)`,
          }}
        >
          <Pixel name="hands" priority />
        </div>
        <div
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "70%",
            width: "60%",
            aspectRatio: "1",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${palette.peach}55 0%, ${palette.peach}00 70%)`,
            opacity: s.boatGlow,
          }}
        />
        <div className="boat relative">
          <Pixel name="boat" priority style={{ opacity: round(1 - s.boatGlow) }} />
          <div className="absolute inset-x-[1%] bottom-0" style={{ opacity: s.boatGlow }}>
            <Pixel name="boatLit" priority />
          </div>
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
