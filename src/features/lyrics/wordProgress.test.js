import assert from 'node:assert/strict';
import test from 'node:test';
import lyricsConfig from './config.json';
import { calculateWordProgress } from './wordProgress.js';

const lines = lyricsConfig.lines;

test('calculateWordProgress returns zero progress without active indices', () => {
  const result = calculateWordProgress(lines, -1, -1, 0);
  assert.deepEqual(result, { progress: 0, hasTiming: false });
});

test('calculateWordProgress uses next word timestamp for duration', () => {
  const effectiveTimeMs = 300;
  const result = calculateWordProgress(lines, 0, 0, effectiveTimeMs);
  assert.ok(result.hasTiming, 'ожидалось наличие тайминга для следующего слова');
  assert.ok(result.progress > 0.45 && result.progress < 0.55, 'прогресс должен находиться в пределах 0.5 ± 0.05');
});

test('calculateWordProgress clamps progress between 0 and 1', () => {
  const resultBefore = calculateWordProgress(lines, 0, 1, 100);
  assert.equal(resultBefore.progress, 0, 'прогресс не должен быть отрицательным');

  const resultAfter = calculateWordProgress(lines, 0, 1, 2000);
  assert.equal(resultAfter.progress, 1, 'прогресс не должен превышать 1');
});

test('calculateWordProgress falls back to next line start for the last word in a line', () => {
  const effectiveTimeMs = 3500;
  const result = calculateWordProgress(lines, 0, 2, effectiveTimeMs);
  assert.ok(result.hasTiming, 'ожидался тайминг для перехода к следующей строке');
  assert.ok(result.progress > 0.9, 'прогресс последнего слова должен стремиться к завершению');
});

test('calculateWordProgress handles the final word without available end timestamp', () => {
  const effectiveTimeMs = 12000;
  const result = calculateWordProgress(lines, 2, 5, effectiveTimeMs);
  assert.equal(result.hasTiming, false, 'последнее слово не должно иметь тайминга');
  assert.equal(result.progress, 1, 'прогресс должен быть равен 1 после завершения слова');
});
