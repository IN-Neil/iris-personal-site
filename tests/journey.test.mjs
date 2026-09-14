import assert from 'node:assert/strict';
import test from 'node:test';
import { sceneState, storyProgress, exampleWindow, exampleVisibility, chapterPhases, segments, SCROLL_SCREENS } from '../src/lib/journey.ts';

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

for (const [id, count] of [['questions', 5], ['building', 4], ['community', 3], ['part', 3]]) {
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
  const at27 = storyProgress(27 / (SCROLL_SCREENS - 1));
  assert.ok(at27 > 0.84 && at27 < 0.92);
  assert.equal(exampleVisibility(at27, last), 0);
});

test('the candle boat is visible from departure through every chapter', () => {
  for (const progress of [0, 0.02, 0.12, 0.3, 0.48, 0.66, 0.84, 1]) {
    assert.equal(sceneState(progress).boatGlow, 1);
  }
});
