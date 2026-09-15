// Journey checks in headless Chrome over the DevTools protocol (no dependencies).
//
//   node scripts/journey-check.mjs capture <url> <outDir> <W>x<H> [name=screens ...]
//   node scripts/journey-check.mjs compare <dirA> <dirB>
//   node scripts/journey-check.mjs sweep   <url> <out.json> <W>x<H> [<W>x<H> ...]
//
// Positions are in viewport-heights of journey travel (0 → 29). CSS animations are
// frozen at their first frame so screenshots are comparable. Sizes are CSS viewport
// pixels with no browser controls: they are not device screens.
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.CDP_PORT ?? 9520);
const TRAVEL = 31; // viewport heights of journey travel (SCROLL_SCREENS - 1 in journey.ts)

export const moments = {
  departure: 0,
  "ch1-copy": 2.5,
  "q-longest": 7.87,
  "ch2-copy": 9.8,
  "project-longest": 11.67,
  "skyfall-moon": 15.1,
  "skyfall-meteors": 16.2,
  "ch3-copy": 18.1,
  "storm-ch4-copy": 24,
  "storm-example": 26.5,
  "open-water": 28.8,
  arrival: 31,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function openChrome() {
  const profile = join(tmpdir(), `journey-check-${PORT}`);
  const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run", "--hide-scrollbars", "--mute-audio", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
  process.on("exit", () => chrome.kill());
  let socket;
  for (let i = 0; i < 60 && !socket; i++) {
    try {
      const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
      socket = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    } catch {
      socket = undefined;
      await sleep(200);
    }
  }
  if (!socket) throw new Error("Chrome did not start");
  let nextId = 1;
  const pending = new Map();
  const waiters = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method) {
      for (const waiter of [...waiters]) if (waiter.method === message.method) { waiters.splice(waiters.indexOf(waiter), 1); waiter.resolve(message.params); }
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const next = (method) => new Promise((resolve) => waiters.push({ method, resolve }));
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails).slice(0, 500));
    return result.result.value;
  };
  await send("Page.enable");
  await send("Animation.enable");
  return { send, next, evaluate };
}

async function load(cdp, url, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  // NO_JS=1 renders the server HTML and CSS only: what the first paint shows before hydration.
  await cdp.send("Emulation.setScriptExecutionDisabled", { value: Boolean(process.env.NO_JS) });
  const loaded = cdp.next("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 0 });
  // Without scripts, page-context waits never settle; a plain delay covers fonts and images.
  if (process.env.NO_JS) await sleep(1500);
  else await cdp.evaluate("document.fonts.ready.then(() => new Promise((r) => setTimeout(r, 600)))");
}

// Works on the original build (no hooks) and on hooked builds.
const SCROLL_TO = `(screens) => {
  document.documentElement.style.scrollBehavior = "auto";
  const container = document.querySelector('[data-journey="container"]') ?? [...document.querySelectorAll("main div")].find((d) => /\\d+vh/.test(d.style.height) && d.offsetParent !== null);
  const stage = document.querySelector('[data-journey="stage"]') ?? container.firstElementChild;
  const top = container.getBoundingClientRect().top + window.scrollY;
  // Hooked builds measure travel on a fixed track (the container can extend past it on phones).
  const track = document.querySelector('[data-journey="track"]');
  const travel = track ? track.offsetHeight : container.offsetHeight - stage.offsetHeight;
  window.scrollTo({ top: screens === "end" ? document.documentElement.scrollHeight : top + (screens / ${TRAVEL}) * travel, behavior: "instant" });
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));
}`;

async function capture(url, outDir, size, only) {
  const [width, height] = size.split("x").map(Number);
  mkdirSync(outDir, { recursive: true });
  const cdp = await openChrome();
  // "end=end" captures the very bottom of the page (the ending after it has scrolled up).
  const chosen = only.length ? Object.fromEntries(only.map((item) => { const [name, value] = item.split("="); return [name, value === "end" ? "end" : Number(value ?? moments[name])]; })) : moments;
  for (const [name, screens] of Object.entries(chosen)) {
    await load(cdp, url, width, height);
    if (process.env.NO_JS && screens !== 0) throw new Error("NO_JS captures only position 0 (no scrolling without scripts)");
    if (!process.env.NO_JS) await cdp.evaluate(`(${SCROLL_TO})(${JSON.stringify(screens)})`);
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(outDir, `${width}x${height}-${name}.png`), Buffer.from(data, "base64"));
    console.log("captured", name, screens);
  }
}

async function compare(dirA, dirB) {
  const cdp = await openChrome();
  const files = readdirSync(dirA).filter((file) => file.endsWith(".png"));
  const results = [];
  for (const file of files) {
    const a = readFileSync(join(dirA, file)).toString("base64");
    const b = readFileSync(join(dirB, file)).toString("base64");
    const result = await cdp.evaluate(`(async () => {
      const read = (src) => new Promise((resolve) => { const img = new Image(); img.onload = () => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext("2d"); x.drawImage(img, 0, 0); resolve(x.getImageData(0, 0, img.width, img.height)); }; img.src = src; });
      const [a, b] = await Promise.all([read("data:image/png;base64,${a}"), read("data:image/png;base64,${b}")]);
      if (a.width !== b.width || a.height !== b.height) return { sizeMismatch: true };
      let changed = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
      for (let i = 0; i < a.data.length; i += 4) {
        const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
        if (d > 24) { changed++; const p = i / 4, x = p % a.width, y = (p / a.width) | 0; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
      }
      return { changed, total: a.width * a.height, box: changed ? [minX, minY, maxX, maxY] : null };
    })()`);
    results.push({ file, ...result });
    console.log(file, JSON.stringify(result));
  }
  return results;
}

// Geometry sweep on a hooked build. Every check uses rendered rectangles (transforms included).
const SWEEP = `async (positions) => {
  const q = (s) => [...document.querySelectorAll(s)];
  const stage = document.querySelector('[data-journey="stage"]');
  const boat = document.querySelector('[data-journey="boat"]');
  const examples = q('[data-journey="example"]');
  const copies = q('[data-journey="copy"]');
  const lighthouse = document.querySelector('[data-journey="lighthouse"]');
  const moon = document.querySelector('[data-journey="moon"]');
  const intro = document.querySelector('[data-journey="intro"]');
  const endingScene = document.querySelector('[data-journey="ending-scene"]');
  const sound = document.querySelector(".journey-sound");
  const opacity = (el) => { let o = 1; for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const c = getComputedStyle(n); if (c.display === "none" || c.visibility === "hidden") return 0; o *= Number(c.opacity); } return o; };
  const box = (el) => { const kids = el.children.length ? [...el.children] : [el]; const r = kids.map((k) => k.getBoundingClientRect()); return { left: Math.min(...r.map((x) => x.left)), right: Math.max(...r.map((x) => x.right)), top: Math.min(...r.map((x) => x.top)), bottom: Math.max(...r.map((x) => x.bottom)) }; };
  const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  const scrollTo = ${SCROLL_TO};
  const fails = [];
  // The star layer's translate is a pure function of story progress: use it to prove travel is continuous.
  const layer = document.querySelector('[data-journey="scene"] .will-change-transform');
  const shift = () => Number((layer.style.transform.match(/translate3d\\((-?[\\d.]+)%/) ?? [0, 0])[1]);
  const shifts = [];
  const peak = Object.fromEntries(examples.map((e, i) => [i + ":" + e.dataset.text, 0]));
  for (const s of positions) {
    await scrollTo(s);
    shifts.push(shift());
    const frame = stage.getBoundingClientRect();
    const inside = (r, slack = 0.5) => r.left >= frame.left - slack && r.right <= frame.right + slack && r.top >= frame.top - slack && r.bottom <= frame.bottom + slack;
    const b = boat.getBoundingClientRect();
    if (!inside(b)) fails.push({ s, what: "boat outside frame", left: Math.round(b.left), right: Math.round(b.right) });
    // Legibility: text over the bright moon. Reported separately from clipping and boat collisions.
    const m = moon && opacity(moon) >= 0.5 ? moon.getBoundingClientRect() : null;
    const visibleIntro = intro && opacity(intro) >= 0.5;
    if (visibleIntro && overlaps(box(intro), b)) fails.push({ s, what: "intro over boat" });
    examples.forEach((e, i) => {
      const o = opacity(e);
      const key = i + ":" + e.dataset.text;
      peak[key] = Math.max(peak[key], o);
      if (o < 0.5) return;
      const r = box(e);
      if (!inside(r)) fails.push({ s, what: "example clipped", text: e.dataset.text, left: Math.round(r.left), right: Math.round(r.right) });
      if (overlaps(r, b)) fails.push({ s, what: "example over boat", text: e.dataset.text });
      if (m && overlaps(r, m)) fails.push({ s, what: "example over moon", text: e.dataset.text });
    });
    for (const c of copies) {
      if (opacity(c) < 0.5) continue;
      const r = c.getBoundingClientRect();
      if (overlaps(r, b)) fails.push({ s, what: "copy over boat", chapter: c.dataset.chapter, copyBottom: Math.round(r.bottom), boatTop: Math.round(b.top) });
      if (m && overlaps(r, m)) fails.push({ s, what: "copy over moon", chapter: c.dataset.chapter });
      if (!inside(r)) fails.push({ s, what: "copy outside frame", chapter: c.dataset.chapter, top: Math.round(r.top), bottom: Math.round(r.bottom) });
    }
    if (lighthouse && opacity(lighthouse) >= 0.5) {
      const r = lighthouse.getBoundingClientRect();
      if (r.left < frame.left - 0.5 || r.right > frame.right + 0.5) fails.push({ s, what: "lighthouse clipped", left: Math.round(r.left), right: Math.round(r.right) });
    }
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth) fails.push({ s, what: "horizontal page overflow" });
  }
  // The ending in the lighthouse scene: at arrival (29) and at the very bottom of the page.
  const endingReport = {};
  if (endingScene && getComputedStyle(endingScene).display !== "none") {
    const panel = endingScene.querySelector("section");
    const column = [".journey-ending-label", ".journey-ending-heading", ".journey-ending-body"].map((c) => endingScene.querySelector(c));
    const lh = () => lighthouse.getBoundingClientRect();
    const describe = () => {
      const p = panel.getBoundingClientRect();
      const b = boat.getBoundingClientRect();
      const snd = sound ? sound.getBoundingClientRect() : null;
      const heading = endingScene.querySelector(".journey-ending-heading").getBoundingClientRect();
      // Only rendered links count: a display:none link has a zero box that would read as "on screen".
      const links = [...endingScene.querySelectorAll("a")].filter((a) => a.offsetParent !== null).map((a) => a.getBoundingClientRect());
      return {
        panelTop: Math.round(p.top), panelBottom: Math.round(p.bottom), boatTop: Math.round(b.top), viewport: innerHeight,
        clearOfBoat: p.bottom <= b.top, headingUnderSoundControl: snd ? overlaps(heading, snd) : false,
        columnOverLighthouse: column.some((el) => overlaps(el.getBoundingClientRect(), lh())),
        linksFullyOnScreen: links.filter((r) => r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth).length, links: links.length,
      };
    };
    await scrollTo(${TRAVEL});
    endingReport.arrival = describe();
    await scrollTo("end");
    endingReport.pageEnd = { ...describe(), scrollBeyondJourneyPx: Math.round(document.documentElement.scrollHeight - innerHeight - (document.querySelector('[data-journey="container"]').getBoundingClientRect().top + scrollY) - document.querySelector('[data-journey="track"]').offsetHeight) };
    if (!endingReport.pageEnd.clearOfBoat) fails.push({ s: "end", what: "ending over boat at page end" });
    if (endingReport.pageEnd.linksFullyOnScreen < endingReport.pageEnd.links) fails.push({ s: "end", what: "ending links not fully on screen at page end" });
    if (endingReport.arrival.columnOverLighthouse) fails.push({ s: ${TRAVEL}, what: "ending text over lighthouse" });
  }
  let reversals = 0;
  const ordered = positions.every((p, i) => i === 0 || p !== positions[i - 1]) && positions.length > 1 && positions[1] !== positions[0];
  const direction = Math.sign(positions[positions.length - 1] - positions[0]);
  if (ordered) for (let i = 1; i < shifts.length; i++) if (Math.sign(positions[i] - positions[i - 1]) === direction && (shifts[i] - shifts[i - 1]) * direction > 1e-9) reversals++;
  const neverFull = Object.entries(peak).filter(([, o]) => o < 0.99).map(([k]) => k);
  return { endingReport, examplesFound: examples.length, copiesFound: copies.length, checked: positions.length, travelReversals: reversals, travelFirstLast: [shifts[0], shifts[shifts.length - 1]], neverFullyVisible: neverFull, failCount: fails.length, fails };
}`;

async function sweep(url, outFile, sizes) {
  const cdp = await openChrome();
  const forward = Array.from({ length: TRAVEL * 20 + 1 }, (_, i) => Number((i / 20).toFixed(2)));
  const jumps = Array.from({ length: 200 }, (_, i) => Number(((Math.sin(i * 91.7) * 0.5 + 0.5) * TRAVEL).toFixed(2)));
  const report = [];
  for (const size of sizes) {
    const [width, height] = size.split("x").map(Number);
    for (const [direction, positions] of [["forward", forward], ["backward", [...forward].reverse()], ["jumps", jumps]]) {
      await load(cdp, url, width, height);
      await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 });
      const result = await cdp.evaluate(`(${SWEEP})(${JSON.stringify(positions)})`);
      const grouped = {};
      for (const f of result.fails) { const key = [f.what, f.text ?? f.chapter ?? ""].join(" · "); (grouped[key] ??= []).push(f.s); }
      const summary = Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, { count: v.length, from: Math.min(...v), to: Math.max(...v) }]));
      report.push({ size, direction, ...result, summary });
      if (direction === "forward") console.log(size, "ending", JSON.stringify(result.endingReport));
      console.log(size, direction, "travel reversals", result.travelReversals, JSON.stringify(result.travelFirstLast), "examples", result.examplesFound, "copies", result.copiesFound, "checked", result.checked, "fails", result.failCount, JSON.stringify(summary), result.neverFullyVisible.length ? "NEVER FULL: " + result.neverFullyVisible.join(", ") : "");
    }
  }
  writeFileSync(outFile, JSON.stringify(report, null, 1));
  return report;
}

const [command, ...args] = process.argv.slice(2);
if (command === "capture") await capture(args[0], args[1], args[2], args.slice(3));
else if (command === "compare") await compare(args[0], args[1]);
else if (command === "sweep") await sweep(args[0], args[1], args.slice(2));
else console.log("usage: capture <url> <outDir> <W>x<H> [name=screens ...] | compare <dirA> <dirB> | sweep <url> <out.json> <W>x<H> ...");
process.exit(0);
