import '../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { useKaraokeTracks } from './useKaraokeTracks.js';

const TestHarness = ({ source, staticTracks }) => {
  const { tracks, isLoading, error } = useKaraokeTracks({ source, staticTracks });

  if (isLoading) {
    return <p data-testid="state">loading</p>;
  }

  if (error) {
    return (
      <p data-testid="state" aria-label="error">
        {error}
      </p>
    );
  }

  return (
    <ul data-testid="tracks">
      {tracks.map((track) => (
        <li key={track.id}>
          {track.title} — {track.artist}
        </li>
      ))}
    </ul>
  );
};

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
      json: async () => [],
    };
  };
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

test('использует статические треки без сетевых запросов', async () => {
  const staticTracks = [
    { id: 'static-1', title: 'Статичный трек', artist: 'Cherry', src: '/media-1.mp4' },
    { title: 'Фолбэк', artist: 'Unknown', src: '/media-2.mp4' },
    { id: 'no-src', title: 'Без ссылки' },
  ];

  render(<TestHarness source="/api/karaoke" staticTracks={staticTracks} />);

  const list = await screen.findByTestId('tracks');
  const items = list.querySelectorAll('li');

  assert.equal(items.length, 2);
  assert.deepEqual(fetchCalls, []);
  assert.ok(Array.from(items).some((item) => item.textContent?.includes('Статичный трек')));
  assert.ok(Array.from(items).some((item) => item.textContent?.includes('Фолбэк')));
});

test('возвращает сетевую ошибку, если статические треки отсутствуют', async () => {
  globalThis.fetch = async () => {
    throw new Error('network failed');
  };

  render(<TestHarness source="/api/karaoke" staticTracks={[]} />);

  await waitFor(() => {
    const state = screen.getByTestId('state');
    assert.equal(state.getAttribute('aria-label'), 'error');
    assert.equal(state.textContent?.includes('network failed'), true);
  });
});

test('загружает по HTTP, если статические треки не переданы', async () => {
  const payload = [
    { id: 'remote-1', title: 'Удалённый', artist: 'API', src: '/remote.mp4' },
  ];

  globalThis.fetch = async (input) => {
    fetchCalls.push(String(input));
    return {
      ok: true,
      status: 200,
      json: async () => payload,
    };
  };

  render(<TestHarness source="/api/karaoke" />);

  await waitFor(() => {
    const items = screen.getAllByRole('listitem');
    assert.equal(items.length, 1);
    assert.ok(items[0].textContent?.includes('Удалённый'));
  });

  assert.deepEqual(fetchCalls, ['/api/karaoke']);
});
