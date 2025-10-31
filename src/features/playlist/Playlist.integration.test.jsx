import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../../App.jsx';

const baseTrack = {
  sourceUrl: 'https://example.com/track',
  status: {
    stage: 'uploading',
    isError: false,
    isFinal: false,
    rawStatus: 'uploading',
    message: 'Обработка начата',
    payload: {},
  },
  history: [],
  lastUpdatedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
  isPolling: false,
  pollingError: '',
  isManualRefresh: false,
};

const createTrack = (overrides) => ({
  id: `track-${Math.random().toString(16).slice(2, 8)}`,
  ...baseTrack,
  ...overrides,
  status: { ...baseTrack.status, ...(overrides?.status ?? {}) },
});

test('выбор трека обновляет виджет статуса и состояние списка', async () => {
  const trackOne = createTrack({
    id: 'track-1',
    sourceUrl: 'https://example.com/first',
    status: {
      stage: 'complete',
      isError: false,
      isFinal: true,
      rawStatus: 'complete',
      message: 'Готово к прослушиванию',
    },
  });
  const trackTwo = createTrack({
    id: 'track-2',
    sourceUrl: 'https://example.com/second',
    status: {
      stage: 'uploading',
      isError: false,
      isFinal: false,
      rawStatus: 'uploading',
      message: 'Загрузка файла',
    },
    lastUpdatedAt: new Date('2024-01-01T12:15:00Z').toISOString(),
  });

  render(<App initialTracks={[trackOne, trackTwo]} />);

  const list = await screen.findByRole('list', { name: /список треков для обработки/i });
  const firstOption = within(list).getByRole('button', { name: /выбрать трек track-1/i });
  const secondOption = within(list).getByRole('button', { name: /выбрать трек track-2/i });

  assert.equal(firstOption.getAttribute('aria-pressed'), 'true');
  assert.equal(secondOption.getAttribute('aria-pressed'), 'false');

  fireEvent.click(secondOption);

  assert.equal(secondOption.getAttribute('aria-pressed'), 'true');
  assert.equal(firstOption.getAttribute('aria-pressed'), 'false');

  await screen.findByText('ID: track-2');
});

test('кнопка добавления располагается после списка', async () => {
  const trackOne = createTrack({ id: 'track-10', sourceUrl: 'https://example.com/ten' });
  const trackTwo = createTrack({ id: 'track-11', sourceUrl: 'https://example.com/eleven' });

  render(<App initialTracks={[trackOne, trackTwo]} />);

  const list = await screen.findByRole('list', { name: /список треков для обработки/i });
  const addButton = await screen.findByRole('button', { name: /добавить трек/i });

  const position = list.compareDocumentPosition(addButton);
  assert.ok(position & Node.DOCUMENT_POSITION_FOLLOWING);
});
