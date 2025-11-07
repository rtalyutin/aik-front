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

const createDataTransfer = () => {
  const store = new Map();

  return {
    dropEffect: 'move',
    effectAllowed: 'all',
    setData: (type, value) => {
      store.set(type, value);
    },
    getData: (type) => store.get(type) ?? '',
  };
};

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

test('очередь воспроизведения отображается вместе со счётчиком', async () => {
  const trackOne = createTrack({ id: 'track-queue-1', sourceUrl: 'https://example.com/queue/1' });

  render(<App initialTracks={[trackOne]} />);

  const queueRegion = await screen.findByRole('region', { name: /очередь воспроизведения/i });
  assert.ok(queueRegion);

  await screen.findByText('0/5');
  await within(queueRegion).findByText(/очередь пуста/i);
});

test('трек добавляется в очередь через drag-and-drop', async () => {
  const trackOne = createTrack({ id: 'track-dnd-1', sourceUrl: 'https://example.com/drag/1' });
  const trackTwo = createTrack({ id: 'track-dnd-2', sourceUrl: 'https://example.com/drag/2' });

  render(<App initialTracks={[trackOne, trackTwo]} />);

  const list = await screen.findByRole('list', { name: /список треков для обработки/i });
  const queueRegion = await screen.findByRole('region', { name: /очередь воспроизведения/i });

  const firstItem = within(list).getByRole('button', { name: /выбрать трек track-dnd-1/i }).closest('li');
  assert.ok(firstItem);

  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(firstItem, { dataTransfer });
  fireEvent.dragEnter(queueRegion, { dataTransfer });
  fireEvent.dragOver(queueRegion, { dataTransfer });
  fireEvent.drop(queueRegion, { dataTransfer });

  await within(queueRegion).findByText('https://example.com/drag/1');
  await within(queueRegion).findByText(/1\/5/);
});

test('очередь не превышает лимит из пяти треков', async () => {
  const tracks = Array.from({ length: 6 }).map((_, index) =>
    createTrack({ id: `track-limit-${index + 1}`, sourceUrl: `https://example.com/limit/${index + 1}` }),
  );

  render(<App initialTracks={tracks} />);

  const list = await screen.findByRole('list', { name: /список треков для обработки/i });
  const queueRegion = await screen.findByRole('region', { name: /очередь воспроизведения/i });

  for (const track of tracks) {
    const item = within(list)
      .getByRole('button', { name: new RegExp(`выбрать трек ${track.id}`, 'i') })
      .closest('li');
    assert.ok(item);

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(item, { dataTransfer });
    fireEvent.dragEnter(queueRegion, { dataTransfer });
    fireEvent.dragOver(queueRegion, { dataTransfer });
    fireEvent.drop(queueRegion, { dataTransfer });
  }

  const queuedItems = within(queueRegion).getAllByRole('listitem');
  assert.equal(queuedItems.length, 5);
  await within(queueRegion).findByText(/5\/5/);
  await within(queueRegion).findByText(/очередь заполнена/i);
});
