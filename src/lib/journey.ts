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

/** How many viewport-widths wide the world is. */
export const WORLD_SCREENS = 6;

/** Vertical scroll length of the desktop journey, in viewport heights. */
export const SCROLL_SCREENS = 9;

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
      return lerp(prevValue, value, smoothstep((p - prevAt) / (at - prevAt)));
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
  return smoothstep(Math.min(fadeIn, fadeOut));
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

const skyStops: ColorStop[] = [
  [0, "#EDE7DC"],
  [0.2, "#D8E0E3"],
  [0.4, "#B4C9D8"],
  [0.57, "#E0BB9D"],
  [0.72, "#7B8894"],
  [0.86, "#3A4650"],
  [1, "#252D35"],
];

const zoomStops: Stop[] = [
  [0, 1],
  [0.12, 1],
  [0.3, 1.02],
  [0.39, 1.14],
  [0.48, 1.06],
  [0.57, 1.06],
  [0.66, 1.12],
  [0.75, 1.12],
  [0.84, 1.0],
  [1, 0.8],
];

const nightStops: Stop[] = [
  [0, 0],
  [0.3, 0.08],
  [0.48, 0.28],
  [0.66, 0.55],
  [0.84, 0.82],
  [1, 1],
];

/** Sea energy: 1 is calm, >1 is choppier. */
const energyStops: Stop[] = [
  [0, 0.7],
  [0.12, 0.8],
  [0.3, 0.95],
  [0.39, 1.35],
  [0.48, 0.95],
  [0.6, 0.9],
  [0.7, 1.45],
  [0.78, 1.0],
  [0.84, 0.75],
  [1, 0.65],
];

const sunYStops: Stop[] = [
  [0, 16],
  [0.3, 24],
  [0.57, 46],
  [0.7, 62],
];

const sunOpacityStops: Stop[] = [
  [0, 0.9],
  [0.5, 0.9],
  [0.62, 0.7],
  [0.7, 0],
];

const moonOpacityStops: Stop[] = [
  [0, 0.18],
  [0.48, 0.3],
  [0.7, 0.75],
  [0.86, 1],
];

const lanternStops: Stop[] = [
  [0.3, 0],
  [0.37, 1],
];

export type SceneState = {
  progress: number;
  sky: string;
  zoom: number;
  night: number;
  energy: number;
  sunY: number;
  sunOpacity: number;
  moonOpacity: number;
  lantern: number;
  sea: { far: string; mid: string; near: string; fore: string };
  shore: string;
  starOpacity: number;
  /** Visibility of "distant lights" in chapter three. */
  distantLights: number;
  /** Visibility of the floating question fragments in chapter one. */
  fragments: number;
  beam: number;
};

export function sceneState(progress: number): SceneState {
  const p = clamp(progress);
  const night = keyframes(p, nightStops);
  const dusk = fadeWindow(p, [0.5, 0.7], 0.1);

  return {
    progress: p,
    sky: colorKeyframes(p, skyStops),
    zoom: keyframes(p, zoomStops),
    night,
    energy: keyframes(p, energyStops),
    sunY: keyframes(p, sunYStops),
    sunOpacity: keyframes(p, sunOpacityStops),
    moonOpacity: keyframes(p, moonOpacityStops),
    lantern: keyframes(p, lanternStops),
    sea: {
      far: mixColor(mixColor("#8FAFCB", "#C79C80", dusk * 0.35), "#2E3D50", night),
      mid: mixColor(palette.ocean, "#26344A", night),
      near: mixColor(palette.surf, "#2C4A62", night),
      fore: mixColor("#3A5F8C", "#1B2633", night),
    },
    shore: mixColor(palette.moss, "#242E2C", night),
    starOpacity: night * night,
    distantLights: fadeWindow(p, [0.46, 0.72], 0.06),
    fragments: fadeWindow(p, [0.08, 0.34], 0.05),
    beam: clamp((night - 0.55) / 0.35),
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
  return (-p * factor * (WORLD_SCREENS - 1)) / WORLD_SCREENS * 100;
}

/**
 * Where to place something inside a parallax layer (as % of layer width) so
 * that it sits at viewport fraction `viewportX` (0 = left edge, 1 = right)
 * when the journey is at `atProgress`.
 */
export function worldX(atProgress: number, viewportX: number, factor: number): number {
  return ((viewportX + atProgress * factor * (WORLD_SCREENS - 1)) / WORLD_SCREENS) * 100;
}
