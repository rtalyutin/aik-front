import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PlaybackProvider, usePlayback } from './PlaybackProvider.jsx';
import Player from './Player.jsx';
import Lyrics from '../lyrics/Lyrics.jsx';

function TelemetryProbe() {
  const { telemetryEvents } = usePlayback();
  return <output data-testid="telemetry">{JSON.stringify(telemetryEvents)}</output>;
}

test('player toggles playback and records telemetry events', async () => {
  render(
    <PlaybackProvider>
      <Player />
      <TelemetryProbe />
    </PlaybackProvider>,
  );

  const audio = screen.getByTestId('player-audio');
  Object.defineProperty(audio, 'duration', { configurable: true, value: 42 });
  audio.dispatchEvent(new window.Event('loadedmetadata'));

  const playButton = screen.getByRole('button', { name: 'Воспроизвести' });
  fireEvent.click(playButton);
  await new Promise((resolve) => setTimeout(resolve, 0));

  const pauseButton = screen.getByRole('button', { name: 'Пауза' });
  assert.ok(pauseButton, 'ожидалась кнопка паузы после начала воспроизведения');

  fireEvent.click(pauseButton);
  await new Promise((resolve) => setTimeout(resolve, 0));

  const telemetry = JSON.parse(screen.getByTestId('telemetry').textContent ?? '[]');
  const eventTypes = telemetry.map((event) => event.type);
  assert.ok(eventTypes.includes('play'), 'телеметрия должна содержать событие play');
  assert.ok(eventTypes.includes('pause'), 'телеметрия должна содержать событие pause');
});

const waitNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

test('lyrics react to seeking and offset adjustments', async () => {
  render(
    <PlaybackProvider>
      <Player />
      <Lyrics />
      <TelemetryProbe />
    </PlaybackProvider>,
  );

  const audio = screen.getByTestId('player-audio');
  Object.defineProperty(audio, 'duration', { configurable: true, value: 90 });
  audio.dispatchEvent(new window.Event('loadedmetadata'));

  const slider = screen.getByLabelText('Перемотка трека');
  fireEvent.change(slider, { target: { value: '3' } });
  audio.dispatchEvent(new window.Event('seeked'));
  await waitNextTick();

  let activeLine = screen.getByRole('listitem', { current: 'true' });
  assert.match(activeLine.textContent, /Звуки собирают истории/, 'первая строка должна быть активной');

  let telemetry = JSON.parse(screen.getByTestId('telemetry').textContent ?? '[]');
  assert.ok(
    telemetry.some((event) => event.type === 'seek'),
    'телеметрия должна содержать событие seek после перемотки',
  );

  const increaseButton = screen.getByRole('button', { name: /\+300/ });
  fireEvent.click(increaseButton);
  fireEvent.click(increaseButton);
  await waitNextTick();

  activeLine = screen.getByRole('listitem', { current: 'true' });
  assert.match(activeLine.textContent, /Мы поём по новым правилам/, 'смещение должно выделить следующую строку');

  const activeWord = document.querySelector('.lyrics__word--active');
  assert.ok(activeWord, 'активное слово должно быть подсвечено');
});
