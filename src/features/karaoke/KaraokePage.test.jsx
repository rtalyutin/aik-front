import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import KaraokePage from './KaraokePage.jsx';

const sampleTracks = [
  {
    id: 'neon-dreams',
    title: 'Неоновые сны',
    artist: 'Cherry RAiT',
    src: 'https://example.com/neon-dreams.mp4',
    captions: '/karaoke-subtitles.vtt',
  },
  {
    id: 'city-lights',
    title: 'Огни большого города',
    artist: 'Cherry RAiT',
    src: 'https://example.com/city-lights.mp4',
    captions: '/karaoke-subtitles.vtt',
  },
];

let originalFetch;
let fetchCalls;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchCalls = [];
  globalThis.fetch = async (input) => {
    fetchCalls.push(String(input));

    return {
      ok: true,
      status: 200,
      json: async () => sampleTracks,
    };
  };
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

test('загружает и отображает список треков', async () => {
  render(<KaraokePage />);

  const playlistHeading = await screen.findByRole('heading', { name: 'Плейлист' });
  assert.ok(playlistHeading);

  const trackButtons = await screen.findAllByRole('button', { name: /Cherry RAiT$/ });
  assert.equal(trackButtons.length, sampleTracks.length);

  assert.deepEqual(fetchCalls, ['/karaoke-tracks.json']);
});

test('переключает активный трек и обновляет источник видео', async () => {
  const playCalls = [];
  const originalPlay = window.HTMLMediaElement.prototype.play;

  window.HTMLMediaElement.prototype.play = function play() {
    playCalls.push(this.getAttribute('src'));
    return Promise.resolve();
  };

  try {
    render(<KaraokePage />);

    const secondTrackButton = await screen.findByRole('button', {
      name: 'Огни большого города — Cherry RAiT',
    });

    fireEvent.click(secondTrackButton);

    const video = await screen.findByLabelText('Воспроизведение: Огни большого города');

    assert.equal(video.getAttribute('src'), sampleTracks[1].src);

    fireEvent(video, new Event('loadeddata'));

    await waitFor(() => {
      assert.ok(playCalls.includes(sampleTracks[1].src));
    });
  } finally {
    window.HTMLMediaElement.prototype.play = originalPlay;
  }
});
