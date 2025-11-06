import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import karaokeConfig from './config.json';
import KaraokePage from './KaraokePage.jsx';

const PAGE_SIZE = karaokeConfig.pagination?.pageSize ?? 6;

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
  {
    id: 'midnight-drive',
    title: 'Ночной драйв',
    artist: 'Cherry RAiT',
    src: 'https://example.com/midnight-drive.mp4',
    captions: '/karaoke-subtitles.vtt',
  },
  {
    id: 'city-echoes',
    title: 'Эхо мегаполиса',
    artist: 'Cherry RAiT',
    src: 'https://example.com/city-echoes.mp4',
    captions: '/karaoke-subtitles.vtt',
  },
  {
    id: 'starlight-dust',
    title: 'Звёздная пыль',
    artist: 'Cherry RAiT',
    src: 'https://example.com/starlight-dust.mp4',
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
  const { container } = render(<KaraokePage />);

  const playlistHeading = await screen.findByRole('heading', { name: 'Плейлист' });
  assert.ok(playlistHeading);

  const trackButtons = await screen.findAllByRole('button', { name: /Cherry RAiT$/ });
  assert.equal(trackButtons.length, PAGE_SIZE);

  const searchLabel = await screen.findByLabelText('Поиск по трекам');
  assert.ok(searchLabel);

  const searchField = container.querySelector('.karaoke-page__search-field');
  assert.ok(searchField);

  const searchIcon = searchField.querySelector('.karaoke-page__search-icon');
  assert.ok(searchIcon);
  assert.equal(searchIcon.getAttribute('aria-hidden'), 'true');

  assert.deepEqual(fetchCalls, ['/karaoke-tracks.json']);
});

test('фильтрует треки по названию', async () => {
  render(<KaraokePage />);

  const searchInput = await screen.findByLabelText('Поиск по трекам');

  fireEvent.change(searchInput, { target: { value: 'город' } });

  await waitFor(() => {
    const remainingButton = screen.getByRole('button', {
      name: 'Огни большого города — Cherry RAiT',
    });

    assert.ok(remainingButton);
    assert.equal(
      screen.queryByRole('button', { name: 'Неоновые сны — Cherry RAiT' }),
      null,
    );
  });
});

test('фильтрует треки по исполнителю и показывает пустой результат', async () => {
  render(<KaraokePage />);

  const searchInput = await screen.findByLabelText('Поиск по трекам');

  fireEvent.change(searchInput, { target: { value: 'Cherry' } });

  await waitFor(() => {
    const visibleButtons = screen.getAllByRole('button', { name: /Cherry RAiT$/ });
    assert.equal(visibleButtons.length, Math.min(sampleTracks.length, PAGE_SIZE));
    assert.ok(screen.getByRole('button', { name: 'Страница 3' }));
  });

  fireEvent.change(searchInput, { target: { value: 'несуществующий артист' } });

  await waitFor(() => {
    assert.equal(screen.queryAllByRole('button', { name: /Cherry RAiT$/ }).length, 0);
    assert.ok(screen.getByText('Ничего не найдено'));
  });
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

test('переходит между страницами плейлиста', async () => {
  render(<KaraokePage />);

  const nextButton = await screen.findByRole('button', { name: 'Вперёд' });
  assert.equal(nextButton.hasAttribute('disabled'), false);

  fireEvent.click(nextButton);

  await waitFor(() => {
    assert.ok(
      screen.getByRole('button', { name: 'Ночной драйв — Cherry RAiT' }),
    );
    assert.equal(
      screen.queryByRole('button', { name: 'Неоновые сны — Cherry RAiT' }),
      null,
    );
  });

  const secondPageButton = screen.getByRole('button', { name: 'Страница 2' });
  assert.equal(secondPageButton.getAttribute('aria-current'), 'page');

  const thirdPageButton = screen.getByRole('button', { name: 'Страница 3' });
  fireEvent.click(thirdPageButton);

  await waitFor(() => {
    assert.ok(
      screen.getByRole('button', { name: 'Звёздная пыль — Cherry RAiT' }),
    );
    assert.equal(
      screen.queryByRole('button', { name: 'Эхо мегаполиса — Cherry RAiT' }),
      null,
    );
  });

  const previousButton = screen.getByRole('button', { name: 'Назад' });
  assert.equal(previousButton.hasAttribute('disabled'), false);
});

test('сбрасывает страницу после изменения поискового запроса', async () => {
  render(<KaraokePage />);

  const nextButton = await screen.findByRole('button', { name: 'Вперёд' });
  fireEvent.click(nextButton);

  const thirdPageButton = await screen.findByRole('button', { name: 'Страница 3' });
  fireEvent.click(thirdPageButton);

  await waitFor(() => {
    assert.ok(
      screen.getByRole('button', { name: 'Звёздная пыль — Cherry RAiT' }),
    );
  });

  const searchInput = screen.getByLabelText('Поиск по трекам');
  fireEvent.change(searchInput, { target: { value: 'город' } });

  await waitFor(() => {
    assert.ok(
      screen.getByRole('button', { name: 'Огни большого города — Cherry RAiT' }),
    );
    assert.equal(
      screen.queryByRole('button', { name: 'Звёздная пыль — Cherry RAiT' }),
      null,
    );
  });

  fireEvent.change(searchInput, { target: { value: '' } });

  await waitFor(() => {
    assert.ok(
      screen.getByRole('button', { name: 'Неоновые сны — Cherry RAiT' }),
    );
    assert.equal(
      screen.queryByRole('button', { name: 'Звёздная пыль — Cherry RAiT' }),
      null,
    );
  });
});
