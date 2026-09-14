import type { CSSProperties, ReactNode } from "react";
import { chapters, questionFragments } from "@/content/site";
import {
  exampleWindow,
  exampleVisibility,
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

// Cloud banks drift through the sky layer. One hangs top-left at departure,
// a big one gathers under the moon in chapter two, the rest are the storm.
const clouds = [
  { at: 0, vx: -0.08, top: -6, w: 48 },
  { at: 0, vx: 0.65, top: 8, w: 58 },
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

// Each chapter gives context first, then its examples drift through the sky.
const markers = chapters.flatMap((chapter) => {
  const items = chapter.id === "questions"
    ? questionFragments.map((title) => ({ title }))
    : chapter.items ?? [];
  return items.map((item, i) => {
    const window = exampleWindow(segments[chapter.id], i, items.length);
    return {
      id: chapter.id,
      text: item.title,
      window,
      at: (window[0] + window[1]) / 2,
      vx: [0.2, 0.53, 0.3, 0.55, 0.24][i % 5],
      top: [39, 45, 48, 44, 43][i % 5],
    };
  });
});

// The boat is held over the end of the dock, then drifts a little to the left
// of frame and stays there until the lighthouse pulls it right.
const boatXStops = [
  [0, 49],
  [0.05, 49],
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
  const boatWidth = compact ? 23 : 12;
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

      {/* Cloud banks drift independently of the text. */}
      <Layer progress={s.progress} factor={SKY}>
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
              opacity: keyframes(s.progress, [[0, 0.45], [0.08, 0.45], [0.11, 0], [0.16, 0], [0.2, 0.45]]),
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

        {/* Departure mountains balance the figures across the water. */}
        <div
          className="absolute -translate-y-full"
          style={{
            left: `${worldX(0, 0.55, FAR)}%`,
            top: `${HORIZON + 1}%`,
            width: layerSize(compact ? 65 : 46),
            opacity: fadeWindow(s.progress, [0, 0.33], 0.025),
          }}
        >
          <Pixel name="shoreCliffs" priority />
        </div>

        {/* Arrival: cliffs, the lighthouse and the keeper's cabin, all grounded on the horizon */}
        <div
          className="absolute -translate-y-full"
          style={{ left: `${worldX(1, 0.48, FAR)}%`, opacity: fadeWindow(s.progress, [0.92, 1], 0.04), top: `${HORIZON + 3}%`, width: layerSize(compact ? 110 : 75) }}
        >
          <Pixel name="shoreCliffs" />
        </div>
        <div
          className="absolute -translate-y-full"
          style={{ left: `${worldX(1, 0.74, FAR)}%`, opacity: fadeWindow(s.progress, [0.93, 1], 0.04), top: `${HORIZON - 3}%`, width: compact ? "13cqh" : "9.5cqh" }}
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
          style={{ left: `${worldX(1, 0.86, FAR)}%`, opacity: fadeWindow(s.progress, [0.93, 1], 0.04), top: `${HORIZON - 1.5}%`, width: layerSize(compact ? 12 : 8) }}
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
        {/* Figures and dock share a layer so their feet remain grounded. */}
        <div
          className="absolute inset-y-0"
          style={{
            left: `${worldX(0, 0, NEAR)}%`,
            width: layerSize(100),
          }}
        >
          <div className="absolute" style={{ left: compact ? "-26%" : "-10%", top: "76%", width: compact ? "70%" : "40%" }}>
            <Pixel name="dockWide" priority />
          </div>
          <div className="absolute -translate-y-full" style={{ left: "11%", top: "79%", width: compact ? "8.3cqh" : "10.3cqh" }}>
            <Pixel name="adult" priority />
          </div>
          <div className="absolute -translate-y-full" style={{ left: compact ? "29%" : "22%", top: "79%", width: compact ? "8cqh" : "10.7cqh" }}>
            <Pixel name="child" priority />
          </div>
        </div>

      </Layer>

      {/* Sky text follows the chapter copy; never a list or an early spoiler. */}
      {!compact && (
        <Layer progress={s.progress} factor={MID}>
          {markers.map((marker, i) => (
            <div
              key={`${marker.id}-${i}`}
              className="absolute flex items-start gap-3 font-pixel text-[clamp(1.1rem,1.7vw,1.65rem)] leading-snug text-mist"
              style={{
                left: `${worldX(marker.at, marker.vx, MID)}%`,
                top: `${marker.top}%`,
                width: layerSize(38),
                opacity: exampleVisibility(s.progress, marker.window),
              }}
            >
              {marker.id !== "questions" && <Star className="mt-1.5 block shrink-0" style={{ width: 14 }} />}
              <span>{marker.text}</span>
            </div>
          ))}
        </Layer>
      )}

      {/* The paper boat is already afloat beyond the dock. */}
      <div
        className="absolute -translate-y-full"
        style={{
          left: `${boatX}%`,
          top: `${WATERLINE + 4}%`,
          width: `${boatWidth}%`,
          aspectRatio: "832 / 274",
          containerType: "size",
        }}
      >
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
