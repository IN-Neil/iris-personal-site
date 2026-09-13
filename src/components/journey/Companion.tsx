import { mixColor, palette, round, type SceneState } from "@/lib/journey";
import { Bolt, Cabin, Cloud, Moon, Shore, Star } from "./sprites";

/**
 * Scenery that fills the left of the frame while the camera is pushed in on
 * the boat and a chapter's text sits on the right. Each chapter gets its own:
 * the moon, a break in the clouds, a distant lit shore, and the storm itself.
 * Drawn outside the zoomed world so it composes against the text, not the sea.
 */

// Deterministic scatter for the stars between the clouds in chapter two.
const gapStars = Array.from({ length: 9 }, (_, i) => {
  const seed = Math.sin(i * 7.31) * 10000;
  const frac = (n: number) => n - Math.floor(n);
  return {
    x: round(6 + frac(seed) * 26),
    y: round(14 + frac(seed * 1.9) * 22),
    size: i % 3 === 0 ? 16 : i % 3 === 1 ? 11 : 8,
    delay: round(frac(seed * 2.7) * 3),
  };
});

const shoreLights = [12, 15.5, 19, 24, 27.5, 30];

function QuestionsCompanion({ s }: { s: SceneState }) {
  return (
    <Moon
      className="absolute"
      style={{ left: "9%", top: "14%", width: "19%", opacity: round(0.35 + (1 - s.storm) * 0.65) }}
    />
  );
}

function BuildingCompanion({ s }: { s: SceneState }) {
  const cloud = mixColor(s.cloud, palette.slate, 0.35);
  return (
    <>
      <Cloud fill={cloud} className="absolute" style={{ left: "-4%", top: "4%", width: "26%" }} />
      <Cloud fill={cloud} className="absolute" style={{ left: "16%", top: "40%", width: "22%" }} />
      <Cloud fill={cloud} className="absolute" style={{ left: "-2%", top: "46%", width: "18%" }} />
      {gapStars.map((star, i) => (
        <Star
          key={i}
          className="star absolute"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, animationDelay: `${star.delay}s` }}
        />
      ))}
    </>
  );
}

function CommunityCompanion({ s }: { s: SceneState }) {
  return (
    <>
      <div className="absolute" style={{ left: "0%", top: "34%", width: "36%", height: "10%" }}>
        <Shore fill={s.shore} className="block h-full w-full -scale-x-100" />
      </div>
      <Cabin lit={1} className="absolute" style={{ left: "6%", top: "31%", height: "5%" }} />
      <Cabin lit={1} className="absolute -scale-x-100" style={{ left: "21%", top: "32.5%", height: "4%" }} />
      {shoreLights.map((x, i) => (
        <span
          key={i}
          className="star absolute"
          style={{
            left: `${x}%`,
            top: `${37 + (i % 2) * 0.8}%`,
            width: 5,
            height: 4,
            backgroundColor: palette.peach,
            boxShadow: `0 0 10px 3px ${palette.peach}80`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </>
  );
}

function PartCompanion({ s }: { s: SceneState }) {
  const cloud = mixColor(s.cloud, palette.slate, 0.3);
  const lit = mixColor(cloud, palette.ivory, s.lightning * 0.14);
  return (
    <>
      <Cloud fill={lit} className="absolute" style={{ left: "-8%", top: "6%", width: "34%" }} />
      <Cloud fill={cloud} className="absolute" style={{ left: "12%", top: "16%", width: "30%" }} />
      <Cloud fill={cloud} className="absolute" style={{ left: "-4%", top: "24%", width: "26%" }} />
      <div
        className="absolute"
        style={{ left: "17%", top: "30%", height: "22%", aspectRatio: "6 / 20", opacity: s.lightning }}
      >
        <Bolt className="bolt block h-full w-full" />
      </div>
    </>
  );
}

export function Companion({ s }: { s: SceneState }) {
  if (!s.closeupChapter) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: s.closeup,
        transform: `translate3d(${round((1 - s.closeup) * -6)}%, 0, 0)`,
      }}
    >
      {s.closeupChapter === "questions" && <QuestionsCompanion s={s} />}
      {s.closeupChapter === "building" && <BuildingCompanion s={s} />}
      {s.closeupChapter === "community" && <CommunityCompanion s={s} />}
      {s.closeupChapter === "part" && <PartCompanion s={s} />}
    </div>
  );
}
