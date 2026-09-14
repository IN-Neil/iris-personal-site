/**
 * The math behind the journey.
 *
 * Everything on the page is driven by a single number, `progress`, from 0
 * (start of the scroll) to 1 (end). This file turns that number into camera
 * zoom, time of day, sea energy, colours, and "is this chapter visible".
 */

export const palette = {
  ivory: "#EAE6DE",
  ink: "#221D1A",
  slate: "#3B4548",
  ocean: "#476DA1",
  surf: "#57A9C7",
  sandstone: "#C7936C",
  peach: "#DC9A73",
  moss: "#70835F",
  poppy: "#D96144",
  shell: "#C7B2A0",
} as const;

export type Segment = readonly [start: number, end: number];

/** Where each beat of the story lives on the 0→1 scroll timeline. */
export const segments = {
  intro: [0, 0.12],
  questions: [0.12, 0.3],
  building: [0.3, 0.48],
  community: [0.48, 0.66],
  part: [0.66, 0.84],
  ending: [0.84, 1],
} as const satisfies Record<string, Segment>;

export type SegmentKey = keyof typeof segments;

export const segmentOrder: SegmentKey[] = [
  "intro",
  "questions",
  "building",
  "community",
  "part",
  "ending",
];

/** How many viewport-widths the camera travels across. */
export const WORLD_SCREENS = 6;

/**
 * Layers are drawn a little wider than the camera travels so the final
 * pull-back (zoom < 1) never exposes the edge of the world.
 */
export const LAYER_SCREENS = WORLD_SCREENS + 0.6;

/** Scroll distances in viewport heights. Every interval advances the world. */
export const scrollBeats = [
  [0, 0], [1, 0.12], [8.5, 0.3], [15, 0.48],
  [20.5, 0.66], [26, 0.84], [29, 1],
] as const;
export const SCROLL_SCREENS = 30;

/** Piecewise linear travel: slower chapters, never a frozen scroll interval. */
export function storyProgress(scrollProgress: number): number {
  const distance = clamp(scrollProgress) * (SCROLL_SCREENS - 1);
  for (let i = 1; i < scrollBeats.length; i++) {
    const [end, to] = scrollBeats[i];
    const [start, from] = scrollBeats[i - 1];
    if (distance <= end) return lerp(from, to, (distance - start) / (end - start));
  }
  return 1;
}

/** Examples follow the complete chapter copy, one at a time. */
export function exampleWindow(segment: Segment, index: number, count: number): Segment {
  const [start, end] = segment;
  const length = end - start;
  const slot = 0.54 / count;
  return [start + length * (0.42 + index * slot), start + length * (0.42 + (index + 1) * slot)];
}

export function exampleVisibility(p: number, window: Segment): number {
  return fadeWindow(p, window, (window[1] - window[0]) * 0.14);
}

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Round to 4 decimals. Browsers normalise long floats in inline styles, so
 * un-rounded values would differ between server HTML and client render.
 */
export const round = (n: number) => Math.round(n * 10000) / 10000;

export const smoothstep = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

export type Stop = readonly [at: number, value: number];

/** Piecewise interpolation through `[progress, value]` stops, eased per segment. */
export function keyframes(p: number, stops: readonly Stop[]): number {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [at, value] = stops[i];
    if (p <= at) {
      const [prevAt, prevValue] = stops[i - 1];
      return round(lerp(prevValue, value, smoothstep((p - prevAt) / (at - prevAt))));
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * 0 outside [start, end], 1 in the middle, with soft ramps of width `fade`
 * at both edges. Segments that touch the end of the timeline never fade out.
 */
export function fadeWindow(p: number, [start, end]: Segment, fade = 0.035): number {
  const fadeIn = start <= 0 ? 1 : clamp((p - start) / fade);
  const fadeOut = end >= 1 ? 1 : clamp((end - p) / fade);
  return round(smoothstep(Math.min(fadeIn, fadeOut)));
}

/** Local 0→1 progress inside a segment. */
export function within(p: number, [start, end]: Segment): number {
  return clamp((p - start) / (end - start));
}

export function activeSegment(p: number): SegmentKey {
  for (const key of segmentOrder) {
    const [, end] = segments[key];
    if (p < end) return key;
  }
  return "ending";
}

/** Context first; complete copy lingers before the examples begin. */
export function chapterPhases(p: number, segment: Segment) {
  const [start, end] = segment;
  const len = end - start;
  const t = within(p, segment);
  return {
    visible: fadeWindow(p, [start + 0.02 * len, start + 0.35 * len], 0.04 * len),
    heading: round(smoothstep((t - 0.025) / 0.035)),
    typed: round(clamp((t - 0.06) / 0.09)),
    settled: round(smoothstep(t / 0.06)),
  };
}

/** Midpoint of a segment; used to freeze the scene for the mobile layout. */
export const midpoint = ([start, end]: Segment) => (start + end) / 2;

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  const to = (c: number) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function mixColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const x = clamp(t);
  return rgbToHex([lerp(ca[0], cb[0], x), lerp(ca[1], cb[1], x), lerp(ca[2], cb[2], x)]);
}

export type ColorStop = readonly [at: number, color: string];

export function colorKeyframes(p: number, stops: readonly ColorStop[]): string {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [at, color] = stops[i];
    if (p <= at) {
      const [prevAt, prevColor] = stops[i - 1];
      return mixColor(prevColor, color, smoothstep((p - prevAt) / (at - prevAt)));
    }
  }
  return stops[stops.length - 1][1];
}

// ---------------------------------------------------------------------------
// The scene, as a function of progress
// ---------------------------------------------------------------------------
//
// The whole journey happens at night. Departure is moonlit and calm, clouds
// gather through chapter two, warm distant lights appear in chapter three,
// chapter four is the storm, and the sea settles as the lighthouse comes into
// view.

const skyStops: ColorStop[] = [
  [0, "#1F2C42"],
  [0.2, "#1C2839"],
  [0.4, "#1A222E"],
  [0.57, "#20252F"],
  [0.7, "#12171E"],
  [0.8, "#151B24"],
  [0.9, "#1A2431"],
  [1, "#1D2A3D"],
];

/**
 * The camera never zooms. It sits close to the water the whole way, and the
 * world does the moving: the moon rises and swells across chapters one and
 * two, clouds drift in, the shore slides away and another slides in.
 */

/** Moon position (% of stage) and width (% of stage width), as it travels. */
const moonXStops: Stop[] = [
  [0, 80],
  [0.2, 78],
  [0.36, 28],
  [0.6, 22],
];
const moonYStops: Stop[] = [
  [0, 38],
  [0.2, 38],
  [0.36, 20],
  [0.6, 16],
];
const moonSizeStops: Stop[] = [
  [0, 5],
  [0.2, 6],
  [0.36, 19],
  [0.6, 19],
];

/** 0 = clear moonlit night, 1 = full storm. */
const stormStops: Stop[] = [
  [0, 0],
  [0.25, 0.08],
  [0.36, 0], // chapter two: the clouds part for the stars
  [0.48, 0.05],
  [0.56, 0.3], // chapter three: it clouds over again
  [0.64, 0.5],
  [0.7, 1],
  [0.78, 0.9],
  [0.86, 0.35],
  [0.94, 0.1],
  [1, 0.05],
];

/** Sea energy: 1 is calm, >1 is choppier. */
const energyStops: Stop[] = [
  [0, 0.55],
  [0.12, 0.7],
  [0.3, 0.95],
  [0.39, 1.3],
  [0.48, 1.0],
  [0.6, 1.1],
  [0.7, 2.0],
  [0.78, 1.7],
  [0.86, 1.0],
  [1, 0.65],
];

const moonOpacityStops: Stop[] = [
  [0, 1],
  [0.46, 1],
  [0.56, 0.2], // slips behind the chapter-three clouds
  [0.66, 0],
  [0.86, 0],
  [1, 0.4],
];

const boatGlowStops: Stop[] = [[0, 1]];

const cloudCoverStops: Stop[] = [
  [0, 0.5],
  [0.3, 0.6],
  [0.47, 0.7],
  [0.58, 0.85],
  [0.66, 1],
  [0.86, 0.6],
  [1, 0.35],
];

export type SceneState = {
  progress: number;
  sky: string;
  storm: number;
  energy: number;
  /** Where the moon is right now: `[x%, y%, width%]` of the stage. */
  moon: [number, number, number];
  moonOpacity: number;
  starOpacity: number;
  /** The candle stays lit from departure through the whole journey. */
  boatGlow: number;
  /** Gust that carries the boat away from the dock. */
  wind: number;
  sea: { far: string; mid: string; near: string; fore: string; foam: number };
  shore: string;
  cloud: string;
  /** Overall cloud density; individual clouds also fade in over time. */
  cloudCover: number;
  rain: number;
  lightning: number;
  /** Visibility of "distant lights" in chapter three. */
  distantLights: number;
  beam: number;
};

export function sceneState(progress: number): SceneState {
  const p = clamp(progress);
  const storm = keyframes(p, stormStops);
  const warmth = fadeWindow(p, [0.46, 0.68], 0.1);

  return {
    progress: p,
    sky: colorKeyframes(p, skyStops),
    storm,
    energy: keyframes(p, energyStops),
    moon: [keyframes(p, moonXStops), keyframes(p, moonYStops), keyframes(p, moonSizeStops)],
    moonOpacity: keyframes(p, moonOpacityStops),
    starOpacity: round(clamp((1 - storm) * 0.9 + fadeWindow(p, segments.building, 0.05) * 0.1)),
    boatGlow: keyframes(p, boatGlowStops),
    wind: fadeWindow(p, [0.05, 0.3], 0.03), // chapter one is the windy chapter
    sea: {
      far: mixColor(mixColor("#3A5477", "#4B4E5E", warmth * 0.4), "#2A3038", storm),
      mid: mixColor(palette.ocean, "#2B3745", storm),
      near: mixColor("#3E7F9B", "#33505F", storm),
      fore: mixColor("#274266", "#151C26", storm),
      foam: round(clamp((storm - 0.3) / 0.6) * 0.75),
    },
    shore: mixColor("#2C3A3C", "#121920", storm),
    cloud: mixColor("#2B3646", "#0F141B", storm),
    cloudCover: keyframes(p, cloudCoverStops),
    rain: round(clamp((storm - 0.5) / 0.4)),
    lightning: fadeWindow(p, [0.66, 0.82], 0.03),
    distantLights: fadeWindow(p, [0.46, 0.72], 0.06),
    beam: round(clamp((p - 0.8) / 0.08)),
  };
}

// ---------------------------------------------------------------------------
// Layer positioning
// ---------------------------------------------------------------------------

/**
 * Horizontal translation for a parallax layer, as a percentage of the layer's
 * own width. A layer with factor 1 moves exactly with the camera.
 */
export function layerShift(p: number, factor: number): number {
  return round(((-p * factor * (WORLD_SCREENS - 1)) / LAYER_SCREENS) * 100);
}

/**
 * Where to place something inside a parallax layer (as % of layer width) so
 * that it sits at viewport fraction `viewportX` (0 = left edge, 1 = right)
 * when the journey is at `atProgress`.
 */
export function worldX(atProgress: number, viewportX: number, factor: number): number {
  return round(((viewportX + atProgress * factor * (WORLD_SCREENS - 1)) / LAYER_SCREENS) * 100);
}

/** Convert a size given as % of the stage width into % of a layer's width. */
export function layerSize(stagePercent: number): string {
  return `${round(stagePercent / LAYER_SCREENS)}%`;
}
