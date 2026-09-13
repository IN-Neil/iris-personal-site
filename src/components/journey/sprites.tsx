import Image from "next/image";
import type { CSSProperties } from "react";
import { palette } from "@/lib/journey";

// ---------------------------------------------------------------------------
// Drawn sprites — pixel-art PNGs in /public/sprites, rendered with nearest-
// neighbour scaling so the blocks stay sharp at any size. Sizes are the real
// pixel dimensions of each file, used only for aspect ratio.
// ---------------------------------------------------------------------------

export const drawn = {
  boat: { src: "/sprites/boat.png", w: 832, h: 274 },
  boatLit: { src: "/sprites/boat-lit.png", w: 814, h: 246 },
  hands: { src: "/sprites/hands.png", w: 752, h: 376 },
  moon: { src: "/sprites/moon.png", w: 327, h: 332 },
  cloudBank: { src: "/sprites/cloud-bank.png", w: 1025, h: 296 },
  shoreDock: { src: "/sprites/shore-dock.png", w: 1030, h: 323 },
  shoreCliffs: { src: "/sprites/shore-cliffs.png", w: 1029, h: 237 },
  lighthouse: { src: "/sprites/lighthouse.png", w: 228, h: 764 },
  cabin: { src: "/sprites/cabin.png", w: 444, h: 298 },
} as const;

export type DrawnKey = keyof typeof drawn;

type PixelProps = {
  name: DrawnKey;
  className?: string;
  style?: CSSProperties;
  /** Load eagerly; use for anything visible on first paint. */
  priority?: boolean;
};

/** A drawn sprite. Give the wrapper a width (or height); the image fills it. */
export function Pixel({ name, className, style, priority }: PixelProps) {
  const { src, w, h } = drawn[name];
  return (
    <Image
      src={src}
      alt=""
      width={w}
      height={h}
      unoptimized
      priority={priority}
      draggable={false}
      className={`pixel h-auto w-full select-none ${className ?? ""}`}
      style={style}
    />
  );
}

/**
 * Small pixel-art sprites drawn as SVG rectangles on a grid.
 * Every sprite uses `shape-rendering="crispEdges"` so edges stay sharp when
 * scaled, which is what gives the scene its low-res feel without pixel fonts.
 */

type Cell = readonly [x: number, y: number, w?: number, h?: number];

function Cells({ cells, fill }: { cells: readonly Cell[]; fill: string }) {
  return (
    <>
      {cells.map(([x, y, w = 1, h = 1], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </>
  );
}

type SpriteProps = {
  className?: string;
  style?: CSSProperties;
};

// ---------------------------------------------------------------------------
// Paper boat — the folded kind kids make. Ivory paper, one shaded fold.
// ---------------------------------------------------------------------------

const boatSailCells: Cell[] = Array.from({ length: 7 }, (_, i) => [11 - i, i, 2 + i * 2, 1] as const);

const boatHullCells: Cell[] = [
  [0, 7, 24, 1],
  [1, 8, 22, 1],
  [2, 9, 20, 1],
  [4, 10, 16, 1],
  [6, 11, 12, 1],
];

// Right-hand side of each hull row, in the shadow of the fold.
const boatHullShade: Cell[] = [
  [12, 8, 11, 1],
  [12, 9, 10, 1],
  [12, 10, 8, 1],
  [12, 11, 6, 1],
];

const boatSailShade: Cell[] = Array.from({ length: 6 }, (_, i) => [12, i + 1, i + 1, 1] as const);

export function PaperBoat({ glow = 0, className, style }: SpriteProps & { glow?: number }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <Cells cells={boatSailCells} fill={palette.ivory} />
      <Cells cells={boatSailShade} fill={palette.shell} />
      <Cells cells={boatHullCells} fill={palette.ivory} />
      <Cells cells={boatHullShade} fill={palette.shell} />
      {/* the two paper points at bow and stern */}
      <rect x={0} y={6} width={1} height={1} fill={palette.ivory} />
      <rect x={23} y={6} width={1} height={1} fill={palette.ivory} />
      {/* a warm light inside the fold, once the boat carries one */}
      <rect x={9} y={8} width={6} height={2} fill={palette.peach} style={{ opacity: glow * 0.85 }} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Hands — an adult hand, palm up, with a child's hand resting in it.
// Both are warm paper cut-outs; the boat sits on the child's fingertips.
// Shapes are drawn as polygons and rasterised onto a pixel grid.
// ---------------------------------------------------------------------------

type Point = readonly [x: number, y: number];

function ellipse(cx: number, cy: number, rx: number, ry: number, tilt = 0): Point[] {
  return Array.from({ length: 28 }, (_, i) => {
    const a = (i / 28) * Math.PI * 2;
    const x = Math.cos(a) * rx;
    const y = Math.sin(a) * ry;
    return [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)];
  });
}

function inside([px, py]: Point, poly: readonly Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function rasterize(polys: readonly (readonly Point[])[], w: number, h: number): Cell[] {
  const cells: Cell[] = [];
  for (let y = 0; y < h; y++) {
    let runStart = -1;
    for (let x = 0; x <= w; x++) {
      const on = x < w && polys.some((poly) => inside([x + 0.5, y + 0.5], poly));
      if (on && runStart < 0) runStart = x;
      if (!on && runStart >= 0) {
        cells.push([runStart, y, x - runStart, 1]);
        runStart = -1;
      }
    }
  }
  return cells;
}

const HANDS_W = 96;
const HANDS_H = 56;

// Fingers: tapered quads from the palm edge, curling gently upward.
const finger = (x0: number, y0: number, len: number, thick: number, lift: number): Point[] => [
  [x0, y0],
  [x0 + len, y0 - lift],
  [x0 + len + 1, y0 - lift + thick * 0.8],
  [x0, y0 + thick],
];

const adultHandCells = rasterize(
  [
    [[0, 30], [30, 27], [32, 45], [0, 52]], // forearm, entering from the left
    ellipse(46, 36, 17, 12, -0.15), // palm
    finger(58, 24, 30, 5, 5),
    finger(59, 30, 32, 5, 3),
    finger(59, 36, 30, 5, 1),
    finger(58, 42, 25, 5, -1),
    [[38, 27], [45, 13], [52, 13], [50, 29]], // thumb
  ],
  HANDS_W,
  HANDS_H,
);

const childHandCells = rasterize(
  [
    [[12, 15], [38, 16], [38, 25], [12, 26]], // forearm
    ellipse(44, 20, 9, 6.5, -0.1), // palm
    finger(51, 13, 15, 2.6, 2),
    finger(52, 16.5, 16, 2.6, 1),
    finger(52, 20, 15, 2.6, 0),
    finger(51, 23.5, 12, 2.6, -0.5),
    [[38, 17], [42, 10], [46, 10], [45, 18]], // thumb
  ],
  HANDS_W,
  HANDS_H,
);

export function Hands({ className, style }: SpriteProps) {
  return (
    <svg
      viewBox={`0 0 ${HANDS_W} ${HANDS_H}`}
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <Cells cells={adultHandCells} fill={palette.shell} />
      <Cells cells={childHandCells} fill="#E9CBB0" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Cloud and lightning — blocky storm shapes.
// ---------------------------------------------------------------------------

const cloudCells: Cell[] = [
  [5, 0, 6, 1],
  [3, 1, 11, 1],
  [1, 2, 15, 1],
  [0, 3, 18, 2],
  [2, 5, 14, 1],
];

export function Cloud({ fill, className, style }: SpriteProps & { fill: string }) {
  return (
    <svg viewBox="0 0 18 6" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={cloudCells} fill={fill} />
    </svg>
  );
}

const boltCells: Cell[] = [
  [4, 0, 2, 3],
  [3, 3, 2, 3],
  [2, 6, 3, 2],
  [3, 8, 2, 3],
  [2, 11, 2, 3],
  [1, 14, 2, 3],
  [0, 17, 2, 3],
];

export function Bolt({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 6 20" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={boltCells} fill="#F4EEE2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Lighthouse — striped tower, gallery, lantern room, stepped roof.
// ---------------------------------------------------------------------------

const towerRows: Cell[] = Array.from({ length: 30 }, (_, i) => {
  const y = 16 + i;
  const half = 5 + Math.floor(i / 6);
  return [12 - half, y, half * 2, 1] as const;
});

export function Lighthouse({ lit = 0, className, style }: SpriteProps & { lit?: number }) {
  return (
    <svg
      viewBox="0 0 24 46"
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {towerRows.map(([x, y, w, h], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={h}
          fill={Math.floor(i / 5) % 2 === 0 ? palette.ivory : palette.poppy}
        />
      ))}
      {/* base */}
      <rect x={1} y={44} width={22} height={2} fill={palette.ink} />
      {/* gallery */}
      <rect x={3} y={14} width={18} height={2} fill={palette.ink} />
      <rect x={4} y={12} width={1} height={2} fill={palette.ink} />
      <rect x={19} y={12} width={1} height={2} fill={palette.ink} />
      {/* lantern room */}
      <rect x={7} y={7} width={10} height={7} fill={palette.ink} />
      <rect
        x={8}
        y={8}
        width={8}
        height={5}
        fill={palette.peach}
        style={{ opacity: 0.25 + lit * 0.75 }}
      />
      <rect x={11.5} y={8} width={1} height={5} fill={palette.ink} />
      {/* roof */}
      <rect x={6} y={6} width={12} height={1} fill={palette.ink} />
      <rect x={8} y={4} width={8} height={2} fill={palette.ink} />
      <rect x={10} y={2} width={4} height={2} fill={palette.ink} />
      <rect x={11} y={0} width={2} height={2} fill={palette.ink} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Cabin — a keeper's house by the lighthouse with one lit window.
// ---------------------------------------------------------------------------

export function Cabin({ lit = 0, className, style }: SpriteProps & { lit?: number }) {
  return (
    <svg
      viewBox="0 0 20 14"
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x={3} y={6} width={14} height={8} fill={palette.slate} />
      <rect x={1} y={5} width={18} height={1} fill={palette.ink} />
      <rect x={3} y={4} width={14} height={1} fill={palette.ink} />
      <rect x={5} y={3} width={10} height={1} fill={palette.ink} />
      <rect x={7} y={2} width={6} height={1} fill={palette.ink} />
      <rect x={9} y={1} width={2} height={1} fill={palette.ink} />
      <rect x={13} y={1} width={2} height={3} fill={palette.ink} />
      <rect x={8} y={9} width={4} height={5} fill={palette.ink} />
      <rect
        x={5}
        y={8}
        width={2}
        height={2}
        fill={palette.peach}
        style={{ opacity: 0.3 + lit * 0.7 }}
      />
      <rect
        x={13}
        y={8}
        width={2}
        height={2}
        fill={palette.peach}
        style={{ opacity: 0.3 + lit * 0.7 }}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Moon, computed from a circle on a coarse grid. Full, like the mood board.
// ---------------------------------------------------------------------------

function discCells(size: number, cx: number, cy: number, r: number, cut?: { cx: number; cy: number; r: number }) {
  const cells: Cell[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const inside = dx * dx + dy * dy <= r * r;
      if (!inside) continue;
      if (cut) {
        const ex = x + 0.5 - cut.cx;
        const ey = y + 0.5 - cut.cy;
        if (ex * ex + ey * ey <= cut.r * cut.r) continue;
      }
      cells.push([x, y]);
    }
  }
  return cells;
}

const moonCells = discCells(12, 6, 6, 5.6);
const moonShadeCells = discCells(12, 6, 6, 5.6).filter(([x, y]) => (x * 7 + y * 3) % 11 === 0 && x > 3);

export function Moon({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 12 12" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={moonCells} fill="#E9E2D0" />
      <Cells cells={moonShadeCells} fill={palette.shell} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bird — a shallow "m", the classic distant seabird.
// ---------------------------------------------------------------------------

const birdCells: Cell[] = [
  [0, 1],
  [1, 0],
  [2, 1],
  [3, 1],
  [4, 0],
  [5, 1],
];

export function Bird({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 6 2" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={birdCells} fill={palette.ivory} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Star — a four-point pixel star for the milestone markers in chapter two.
// ---------------------------------------------------------------------------

const starCells: Cell[] = [
  [3, 0, 1, 7],
  [0, 3, 7, 1],
  [2, 2, 3, 3],
];

export function Star({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 7 7" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={starCells} fill={palette.ivory} />
      <rect x={3} y={3} width={1} height={1} fill={palette.surf} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sea texture — a stepped wave crest, tiled horizontally as a background.
// ---------------------------------------------------------------------------

const crestHeights = [6, 3, 1, 3, 6, 9, 11, 9];

export function waveDataUri(color: string, foam = 0): string {
  const step = 8;
  const height = 12;
  let d = `M0 ${height}`;
  crestHeights.forEach((h, i) => {
    d += ` V${h} H${(i + 1) * step}`;
  });
  d += ` V${height} Z`;
  // Whitecaps: a one-unit stripe along the crest, only on the higher steps.
  const caps = crestHeights
    .map((h, i) => (h <= 3 ? `<rect x="${i * step}" y="${h}" width="${step}" height="1"/>` : ""))
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${crestHeights.length * step} ${height}" shape-rendering="crispEdges"><path d="${d}" fill="${color}"/><g fill="${palette.ivory}" fill-opacity="${foam}">${caps}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Stepped hill silhouette for the shore, stretched to fit its box. */
export function Shore({ fill, className, style }: SpriteProps & { fill: string }) {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d="M0 40 V34 H6 V28 H12 V22 H18 V17 H26 V13 H36 V10 H48 V8 H62 V7 H78 V6 H100 V40 Z"
        fill={fill}
      />
    </svg>
  );
}
