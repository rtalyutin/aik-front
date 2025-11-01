import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React, { useMemo, useState } from 'react';
import { render, screen } from '@testing-library/react';
import Lyrics from './Lyrics.jsx';
import { PlaybackContext } from '../player/PlaybackProvider.jsx';

function LyricsWithPlayback({ currentTime = 0, offsetMs = 0 }) {
  const [lyricsOffsetMs, setLyricsOffsetMs] = useState(offsetMs);
  const value = useMemo(
    () => ({
      currentTime,
      lyricsOffsetMs,
      setLyricsOffsetMs,
      track: { title: 'Demo track' },
    }),
    [currentTime, lyricsOffsetMs],
  );

  return (
    <PlaybackContext.Provider value={value}>
      <Lyrics />
    </PlaybackContext.Provider>
  );
}

test('active word exposes progress through CSS variable', async () => {
  const { rerender, container } = render(<LyricsWithPlayback currentTime={0} />);

  await screen.findByText('Звуки');
  let activeWord = container.querySelector('.lyrics__word--active');
  assert.ok(activeWord, 'ожидалось активное слово в начальной позиции');
  assert.strictEqual(
    activeWord.style.getPropertyValue('--word-progress') || '0',
    '0',
    'прогресс активного слова должен начинаться с 0',
  );

  rerender(<LyricsWithPlayback currentTime={0.3} />);
  await screen.findByText('Звуки');

  activeWord = container.querySelector('.lyrics__word--active');
  assert.ok(activeWord, 'активное слово должно оставаться в строке');
  assert.ok(
    activeWord.classList.contains('lyrics__word--timed'),
    'для слова с таймингом должен применяться класс с прогрессом',
  );

  const progressValue = parseFloat(activeWord.style.getPropertyValue('--word-progress'));
  assert.ok(
    progressValue > 0.45 && progressValue < 0.55,
    `прогресс должен быть около 0.5, но получено ${progressValue}`,
  );
});
