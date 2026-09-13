import type { CSSProperties } from "react";
import { palette } from "@/lib/journey";

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
// Boat — a small sailboat with one figure holding up a lantern (see sketch).
// ---------------------------------------------------------------------------

const sailCells: Cell[] = Array.from({ length: 14 }, (_, i) => {
  const y = 1 + i;
  const left = Math.round(13 - i * 0.6);
  const right = Math.round(13 + i * 0.25);
  return [left, y, right - left + 1, 1] as const;
});

const hullCells: Cell[] = [
  [2, 18, 24, 1],
  [2, 19, 24, 1],
  [3, 20, 22, 1],
  [4, 21, 20, 1],
  [6, 22, 16, 1],
  [8, 23, 12, 1],
];

const figureCells: Cell[] = [
  [21, 12, 2, 2], // head
  [21, 14, 2, 4], // body
  [23, 13, 1, 1], // raised arm
  [24, 10, 1, 3], // lantern pole
];

export function Boat({ lantern = 0, className, style }: SpriteProps & { lantern?: number }) {
  return (
    <svg
      viewBox="0 0 28 24"
      className={className}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <Cells cells={[[13, 0, 1, 18]]} fill={palette.ink} />
      <Cells cells={sailCells} fill={palette.ivory} />
      <Cells cells={[[10, 9, 2, 1]]} fill={palette.poppy} />
      <Cells cells={[[6, 15, 14, 1]]} fill={palette.ink} />
      <Cells cells={hullCells} fill={palette.ink} />
      <Cells cells={[[2, 19, 24, 1]]} fill={palette.sandstone} />
      <Cells cells={figureCells} fill={palette.ink} />
      <rect x={23} y={8} width={3} height={2} fill={palette.slate} />
      <rect
        x={23.5}
        y={8.5}
        width={2}
        height={1}
        fill={palette.peach}
        style={{ opacity: 0.35 + lantern * 0.65 }}
      />
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
// Moon (crescent) and sun, computed from circles on a coarse grid.
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

const moonCells = discCells(12, 6, 6, 5.6, { cx: 8.4, cy: 4.8, r: 4.9 });
const sunCells = discCells(10, 5, 5, 4.6);

export function Moon({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 12 12" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={moonCells} fill={palette.ivory} />
    </svg>
  );
}

export function Sun({ className, style }: SpriteProps) {
  return (
    <svg viewBox="0 0 10 10" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <Cells cells={sunCells} fill="#F3E6D2" />
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
      <Cells cells={birdCells} fill={palette.slate} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sea texture — a stepped wave crest, tiled horizontally as a background.
// ---------------------------------------------------------------------------

const crestHeights = [6, 3, 1, 3, 6, 9, 11, 9];

export function waveDataUri(color: string): string {
  const step = 8;
  const height = 12;
  let d = `M0 ${height}`;
  crestHeights.forEach((h, i) => {
    d += ` V${h} H${(i + 1) * step}`;
  });
  d += ` V${height} Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${crestHeights.length * step} ${height}" shape-rendering="crispEdges"><path d="${d}" fill="${color}"/></svg>`;
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
