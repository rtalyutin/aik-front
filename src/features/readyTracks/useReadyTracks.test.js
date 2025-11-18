import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { useReadyTracks } from './useReadyTracks.js';

let originalFetch;
let originalEnv;
let fetchCalls;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  originalEnv = process.env.VITE_READY_TRACKS_ENDPOINT;
  fetchCalls = [];
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;

  if (typeof originalEnv === 'undefined') {
    delete process.env.VITE_READY_TRACKS_ENDPOINT;
  } else {
    process.env.VITE_READY_TRACKS_ENDPOINT = originalEnv;
  }
});

test('loads and normalizes ready tracks on mount', async () => {
  process.env.VITE_READY_TRACKS_ENDPOINT = 'https://example.com/ready-tracks';

  const apiPayload = [
    { id: 'first', title: ' Первый трек ', artist: 'Artist', src: ' https://cdn/first.mp4 ' },
    { title: '   ', src: 'https://cdn/second.mp4' },
    null,
  ];

  globalThis.fetch = async (input, options = {}) => {
    fetchCalls.push({ input, options });

    return {
      ok: true,
      status: 200,
      json: async () => apiPayload,
    };
  };

  const { result } = renderHook(() => useReadyTracks());

  assert.equal(result.current.isLoading, true);

  await waitFor(() => {
    assert.equal(result.current.isLoading, false);
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].input, 'https://example.com/ready-tracks');
  assert.ok(fetchCalls[0].options.signal);
  assert.equal(result.current.error, '');
  assert.deepEqual(result.current.tracks, [
    {
      id: 'first',
      title: 'Первый трек',
      artist: 'Artist',
      src: 'https://cdn/first.mp4',
      captions: '',
    },
    {
      id: 'track-2',
      title: 'Трек 2',
      artist: '',
      src: 'https://cdn/second.mp4',
      captions: '',
    },
  ]);
});

test('reports error when endpoint is missing', async () => {
  delete process.env.VITE_READY_TRACKS_ENDPOINT;
  globalThis.fetch = () => {
    throw new Error('fetch should not be called without endpoint');
  };

  const { result } = renderHook(() => useReadyTracks());

  await waitFor(() => {
    assert.equal(result.current.error, 'Источник треков не задан');
  });

  assert.equal(result.current.isLoading, false);
  assert.deepEqual(result.current.tracks, []);
});

test('handles failed requests with a descriptive error', async () => {
  process.env.VITE_READY_TRACKS_ENDPOINT = 'https://example.com/fail';
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => [],
  });

  const { result } = renderHook(() => useReadyTracks());

  await waitFor(() => {
    assert.equal(result.current.error, 'Не удалось загрузить треки (код 500)');
  });

  assert.equal(result.current.isLoading, false);
  assert.deepEqual(result.current.tracks, []);
});
