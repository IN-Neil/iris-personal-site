import assert from 'node:assert/strict';
import test from 'node:test';
import { sceneState, storyProgress, exampleWindow, exampleVisibility, chapterPhases, segments, SCROLL_SCREENS, skyfall, meteorRain, meteorWindows, meteorVisibility } from '../src/lib/journey.ts';

test('every scroll interval advances the scenery, including former frozen interval', () => {
  assert.equal(storyProgress(0), 0);
  assert.equal(storyProgress(1), 1);
  let previous = 0;
  for (let i = 1; i <= 10000; i++) {
    const current = storyProgress(i / 10000);
    assert.ok(current > previous && current <= 1);
    previous = current;
  }
});

for (const [id, count] of [['questions', 5], ['building', 4], ['community', 2], ['part', 3]]) {
  test(`${id}: complete context precedes every example, with no overlapping examples`, () => {
    const segment = segments[id];
    const [start, end] = segment;
    const reading = chapterPhases(start + (end - start) * 0.2, segment);
    assert.equal(reading.typed, 1);
    assert.equal(reading.visible, 1);
    const windows = Array.from({length:count}, (_, i) => exampleWindow(segment, i, count));
    for (const [a, b] of windows) {
      assert.equal(chapterPhases(a, segment).visible, 0);
      assert.equal(exampleVisibility((a + b) / 2, [a, b]), 1);
    }
    for (let i = 0; i <= 1000; i++) {
      const p = start + (end - start) * i / 1000;
      assert.ok(windows.filter(w => exampleVisibility(p, w) > 0).length <= 1);
    }
    assert.ok(windows.at(-1)[1] < end);
  });
}

test('last stars clear before a substantial approach to the lighthouse', () => {
  const last = exampleWindow(segments.part, 2, 3);
  assert.ok(last[1] < 0.84);
  // Open water before the lighthouse (timing spec: 27.78–29.5, after the skyfall interlude added 2 screens).
  const openWater = storyProgress(29 / (SCROLL_SCREENS - 1));
  assert.ok(openWater > 0.84 && openWater < 0.92);
  assert.equal(exampleVisibility(openWater, last), 0);
});

test('the candle boat is visible from departure through every chapter', () => {
  for (const progress of [0, 0.02, 0.12, 0.3, 0.48, 0.66, 0.84, 1]) {
    assert.equal(sceneState(progress).boatGlow, 1);
  }
});

 test('camera stays wide for introduction and arrival, holding close until the final star clears', () => {
  assert.equal(sceneState(0).zoom, 1);
  assert.equal(sceneState(0.12).zoom, 1);
  assert.equal(sceneState(0.19).zoom, 1.4);
  assert.equal(sceneState(exampleWindow(segments.part, 2, 3)[1]).zoom, 1.4);
  assert.equal(sceneState(0.93).zoom, 1);
  assert.equal(sceneState(1).zoom, 1);
  assert.ok(sceneState(0.16).zoom > 1);
  assert.ok(sceneState(0.89).zoom < 1.4);
 });

test('skyfall interlude: no text in the pause, moon gone before the meteors, rain ends as chapter three types', () => {
  const [start, end] = skyfall;
  const close = (a, b) => Math.abs(a - b) < 1e-9;
  // Bounded by the last chapter-two example and the start of chapter three's copy.
  assert.ok(close(start, exampleWindow(segments.building, 3, 4)[1]));
  assert.ok(close(end, segments.community[0] + 0.02 * (segments.community[1] - segments.community[0])));
  for (let i = 1; i < 200; i++) {
    const p = start + ((end - start) * i) / 200;
    for (const id of ['building', 'community']) {
      assert.equal(chapterPhases(p, segments[id]).visible, 0, `${id} copy visible at ${p}`);
    }
    for (const [id, count] of [['building', 4], ['community', 2]]) {
      for (let k = 0; k < count; k++) {
        assert.equal(exampleVisibility(p, exampleWindow(segments[id], k, count)), 0, `${id} example ${k} visible at ${p}`);
      }
    }
  }
  // The shower starts with the moon gone, runs past the pause behind chapter three's
  // label and question, and stops exactly as the body begins typing.
  const [rainStart, rainEnd] = meteorRain;
  assert.equal(sceneState(rainStart).moonOpacity, 0);
  assert.ok(rainStart > start && rainEnd > end);
  assert.equal(chapterPhases(rainEnd, segments.community).typed, 0);
  assert.ok(chapterPhases(rainEnd + 0.002, segments.community).typed > 0);
  assert.ok(chapterPhases(rainEnd, segments.community).heading === 1);
  for (const [a, b] of meteorWindows) assert.ok(a >= 0 && b <= 1 && a < b);
  assert.equal(Math.max(...meteorWindows.map(([, b]) => b)), 1);
  // No gap in the shower: every moment has a meteor window open.
  for (let i = 0; i <= 100; i++) assert.ok(meteorWindows.some(([a, b]) => i / 100 >= a && i / 100 <= b));
  // The pause has its own scroll distance (viewport heights).
  const travel = SCROLL_SCREENS - 1;
  assert.ok(close(storyProgress(14.74 / travel), start));
  assert.ok(close(storyProgress(17.11 / travel), end));
});

test('no meteor is visible outside the shower (regression: first meteor stuck from page load)', () => {
  const [rainStart, rainEnd] = meteorRain;
  for (let i = 0; i <= 2000; i++) {
    const p = i / 2000;
    if (p > rainStart && p < rainEnd) continue;
    meteorWindows.forEach((_, k) => assert.equal(meteorVisibility(p, k), 0, `meteor ${k} visible at ${p}`));
  }
  // Inside the shower every meteor appears and fully fades at both ends.
  meteorWindows.forEach(([a, b], k) => {
    const at = (f) => rainStart + (rainEnd - rainStart) * f;
    assert.equal(meteorVisibility(at((a + b) / 2), k), 1);
    assert.ok(meteorVisibility(at(a + 1e-6), k) < 0.01);
    assert.ok(meteorVisibility(at(b - 1e-6), k) < 0.01);
  });
});
