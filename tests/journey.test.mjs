import assert from 'node:assert/strict';
import test from 'node:test';
import { storyProgress, questionVisibility, chapterPhases, segments, SCROLL_SCREENS } from '../src/lib/journey.ts';

const atScreen = (screen) => screen / (SCROLL_SCREENS - 1);

test('inserted pause preserves the original journey endpoints and never reverses', () => {
  assert.equal(storyProgress(0), 0);
  assert.equal(storyProgress(1), 1);
  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const current = storyProgress(i / 1000);
    assert.ok(current >= previous && current <= 1);
    previous = current;
  }
});

test('questions hold at full visibility over more than a viewport of scrolling', () => {
  for (const screen of [1.55, 2, 2.5, 3, 3.15]) {
    assert.equal(questionVisibility(atScreen(screen)), 1);
    assert.equal(storyProgress(atScreen(screen)), 0.12);
    assert.equal(chapterPhases(storyProgress(atScreen(screen)), segments.questions).visible, 0);
  }
  assert.ok(questionVisibility(atScreen(1.3)) > 0 && questionVisibility(atScreen(1.3)) < 1);
  assert.ok(questionVisibility(atScreen(3.4)) > 0 && questionVisibility(atScreen(3.4)) < 1);
});

test('question fade is followed by a clear gap before chapter one', () => {
  for (const screen of [3.6, 3.8, 4, 4.4]) {
    assert.equal(questionVisibility(atScreen(screen)), 0);
    assert.equal(chapterPhases(storyProgress(atScreen(screen)), segments.questions).visible, 0);
  }
  assert.ok(chapterPhases(storyProgress(atScreen(4.8)), segments.questions).visible > 0);
});

test('later chapters retain their original scenery and navigation progress', () => {
  for (const progress of [0.2, 0.3, 0.48, 0.66, 0.84, 1]) {
    assert.ok(Math.abs(storyProgress(atScreen(progress * 8 + 3)) - progress) < 1e-10);
  }
});
