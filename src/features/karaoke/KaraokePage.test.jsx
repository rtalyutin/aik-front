import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test, { afterEach, beforeEach } from 'node:test';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import karaokeConfig from './config.json';
import KaraokePage from './KaraokePage.jsx';

const TEST_PAGE_SIZE = 2;
const TEST_MAX_VISIBLE_PAGES = 5;
const PREVIOUS_PAGE_LABEL = karaokeConfig.pagination?.labels?.previous ?? 'Назад';
const NEXT_PAGE_LABEL = karaokeConfig.pagination?.labels?.next ?? 'Вперёд';
const PAGE_ARIA_LABEL = karaokeConfig.pagination?.labels?.page || 'Страница';
const PLAY_BUTTON_LABEL = karaokeConfig.playerPlayLabel ?? 'Воспроизвести';
const QUEUE_HEADING = karaokeConfig.queueHeading ?? 'Очередь воспроизведения';
const QUEUE_INSTRUCTIONS = (Array.isArray(karaokeConfig.queueInstructions)
  ? karaokeConfig.queueInstructions
  : karaokeConfig.queueInstructions
    ? [karaokeConfig.queueInstructions]
    : []
)
  .map((instruction) => String(instruction ?? '').trim())
  .filter((instruction) => instruction.length > 0);

const baseTracks = [
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

const extraTracks = Array.from({ length: 40 }, (_, index) => {
  const number = index + 1;

  return {
    id: `extra-track-${number}`,
    title: `Экстра трек ${number}`,
    artist: 'Cherry RAiT',
    src: `https://example.com/extra-track-${number}.mp4`,
    captions: '/karaoke-subtitles.vtt',
  };
});

const sampleTracks = [...baseTracks, ...extraTracks];
const TOTAL_PAGES = Math.ceil(sampleTracks.length / TEST_PAGE_SIZE);

let originalFetch;
let fetchCalls;
let originalPageSize;
let originalMaxVisiblePages;
let hadOriginalMaxVisiblePages;

const queryNumericPaginationButtons = () =>
  Array.from(
    document.querySelectorAll('.karaoke-page__pagination-button--number'),
  );

const queryVisiblePageNumbers = () =>
  queryNumericPaginationButtons()
    .map((button) => Number.parseInt(button.textContent ?? '', 10))
    .filter((value) => Number.isFinite(value));

const createDataTransfer = () => {
  const store = {};

  return {
    dropEffect: 'none',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: [],
    setData(type, value) {
      store[type] = value;
    },
    getData(type) {
      return store[type] ?? '';
    },
    clearData(type) {
      if (typeof type === 'string' && type.length > 0) {
        delete store[type];
      } else {
        Object.keys(store).forEach((key) => {
          delete store[key];
        });
      }
    },
  };
};

const getCurrentPageNumber = () => {
  const activeButton = document.querySelector(
    '.karaoke-page__pagination-button--number[aria-current="page"]',
  );

  if (!activeButton) {
    return 1;
  }

  const value = Number.parseInt(activeButton.textContent ?? '', 10);

  return Number.isFinite(value) ? value : 1;
};

const goToPage = async (targetPage) => {
  await screen.findByRole('button', { name: `${PAGE_ARIA_LABEL} 1` });
  let safety = 0;

  while (getCurrentPageNumber() !== targetPage && safety < TOTAL_PAGES * 2) {
    const currentPage = getCurrentPageNumber();
    const directButton = screen.queryByRole('button', {
      name: `${PAGE_ARIA_LABEL} ${targetPage}`,
    });

    if (directButton) {
      fireEvent.click(directButton);
    } else if (currentPage < targetPage) {
      const nextButton = screen.getByRole('button', { name: NEXT_PAGE_LABEL });
      fireEvent.click(nextButton);
    } else {
      const previousButton = screen.getByRole('button', { name: PREVIOUS_PAGE_LABEL });
      fireEvent.click(previousButton);
    }

    await waitFor(() => {
      const updatedPage = getCurrentPageNumber();
      assert.notEqual(updatedPage, currentPage);
    });

    safety += 1;
  }

  await waitFor(() => {
    const targetButton = screen.getByRole('button', {
      name: `${PAGE_ARIA_LABEL} ${targetPage}`,
    });
    assert.equal(targetButton.getAttribute('aria-current'), 'page');
  });
};

beforeEach(() => {
  originalFetch = globalThis.fetch;
  fetchCalls = [];

  const pagination = karaokeConfig.pagination ?? (karaokeConfig.pagination = {});
  originalPageSize = pagination.pageSize;
  hadOriginalMaxVisiblePages = Object.prototype.hasOwnProperty.call(
    pagination,
    'maxVisiblePages',
  );
  originalMaxVisiblePages = pagination.maxVisiblePages;
  pagination.pageSize = TEST_PAGE_SIZE;
  pagination.maxVisiblePages = TEST_MAX_VISIBLE_PAGES;

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

  const pagination = karaokeConfig.pagination ?? (karaokeConfig.pagination = {});
  pagination.pageSize = originalPageSize;

  if (hadOriginalMaxVisiblePages) {
    pagination.maxVisiblePages = originalMaxVisiblePages;
  } else {
    delete pagination.maxVisiblePages;
  }
});

test('загружает и отображает список треков', async () => {
  const { container } = render(<KaraokePage />);

  const playlistHeading = await screen.findByRole('heading', { name: 'Плейлист' });
  assert.ok(playlistHeading);

  await waitFor(() => {
    const pageNumbers = queryVisiblePageNumbers();
    assert.equal(pageNumbers.length, TEST_MAX_VISIBLE_PAGES);
    assert.deepEqual(pageNumbers, [1, 2, 3, 4, TOTAL_PAGES]);
  });

  const trackButtons = await screen.findAllByRole('button', { name: /Cherry RAiT$/ });
  assert.equal(trackButtons.length, TEST_PAGE_SIZE);

  const playlistList = container.querySelector('.karaoke-page__playlist-list');
  assert.ok(playlistList);

  const player = container.querySelector('.karaoke-page__player');
  assert.ok(player);

  const queueContainer = player.querySelector('.karaoke-page__queue');
  assert.ok(queueContainer);

  const queueTitle = queueContainer.querySelector('.karaoke-page__queue-title');
  assert.ok(queueTitle);
  assert.equal(queueTitle.textContent?.trim(), QUEUE_HEADING);

  const queueList = queueContainer.querySelector('.karaoke-page__queue-list');
  assert.ok(queueList);
  assert.equal(queueList.querySelectorAll('.karaoke-page__queue-item').length, 0);

  const placeholder = player.querySelector('.karaoke-page__placeholder');
  assert.ok(placeholder);

  const playerChildren = Array.from(player.children);
  const queueIndex = playerChildren.indexOf(queueContainer);
  const placeholderIndex = playerChildren.indexOf(placeholder);
  assert(queueIndex >= 0);
  assert(placeholderIndex >= 0);
  assert(queueIndex < placeholderIndex);

  const searchLabel = await screen.findByLabelText('Поиск по трекам');
  assert.ok(searchLabel);

  const searchField = container.querySelector('.karaoke-page__search-field');
  assert.ok(searchField);

  const searchIcon = searchField.querySelector('.karaoke-page__search-icon');
  assert.ok(searchIcon);
  assert.equal(searchIcon.getAttribute('aria-hidden'), 'true');

  assert.deepEqual(fetchCalls, ['/karaoke-tracks.json']);
});

test('отображает инструкцию по управлению очередью', async () => {
  render(<KaraokePage />);

  const heading = await screen.findByText(QUEUE_HEADING);
  assert.ok(heading);

  await waitFor(() => {
    const instructionItems = document.querySelectorAll(
      '.karaoke-page__queue-instructions-item',
    );
    assert.equal(instructionItems.length, QUEUE_INSTRUCTIONS.length);
  });

  for (const instruction of QUEUE_INSTRUCTIONS) {
    const instructionElement = await screen.findByText(instruction);
    assert.ok(instructionElement);
  }
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
    assert.equal(visibleButtons.length, TEST_PAGE_SIZE);

    const pageNumbers = queryVisiblePageNumbers();
    assert.equal(pageNumbers.length, TEST_MAX_VISIBLE_PAGES);
    assert.ok(
      screen.getByRole('button', { name: `${PAGE_ARIA_LABEL} 3` }),
    );
  });

  fireEvent.change(searchInput, { target: { value: 'несуществующий артист' } });

  await waitFor(() => {
    assert.equal(screen.queryAllByRole('button', { name: /Cherry RAiT$/ }).length, 0);
    assert.ok(screen.getByText('Ничего не найдено'));
  });
});

test(
  'добавляет трек в очередь и запускает воспроизведение только по запросу пользователя',
  async () => {
    const playCalls = [];
    const originalPlay = window.HTMLMediaElement.prototype.play;

    window.HTMLMediaElement.prototype.play = function play() {
      playCalls.push(this.getAttribute('src'));
      return Promise.resolve();
    };

    try {
      render(<KaraokePage />);

      await waitFor(() => {
        const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
        assert.equal(queueItems.length, 0);
      });

      const secondTrackButton = await screen.findByRole('button', {
        name: 'Огни большого города — Cherry RAiT',
      });

      fireEvent.click(secondTrackButton);

      await waitFor(() => {
        const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
        assert.equal(queueItems.length, 1);
      });

      const video = await screen.findByLabelText('Воспроизведение: Огни большого города');

      assert.equal(video.getAttribute('src'), sampleTracks[1].src);

      const playButton = await screen.findByRole('button', {
        name: PLAY_BUTTON_LABEL,
      });

      assert.equal(playButton.hasAttribute('disabled'), true);

      fireEvent(video, new window.Event('loadeddata'));

      await waitFor(() => {
        assert.equal(playButton.hasAttribute('disabled'), false);
      });

      assert.equal(playCalls.length, 0);

      fireEvent.click(playButton);

      await waitFor(() => {
        assert.ok(playCalls.includes(sampleTracks[1].src));
      });
    } finally {
      window.HTMLMediaElement.prototype.play = originalPlay;
    }
  },
);

test('управляет пагинацией в соответствии с конфигурацией', async () => {
  render(<KaraokePage />);

  const previousButton = await screen.findByRole('button', { name: PREVIOUS_PAGE_LABEL });
  const nextButton = screen.getByRole('button', { name: NEXT_PAGE_LABEL });

  assert.equal(previousButton.hasAttribute('disabled'), true);
  assert.equal(nextButton.hasAttribute('disabled'), false);

  await waitFor(() => {
    const pageNumbers = queryVisiblePageNumbers();
    assert.deepEqual(pageNumbers, [1, 2, 3, 4, TOTAL_PAGES]);
  });

  await goToPage(2);
  await waitFor(() => {
    assert.deepEqual(queryVisiblePageNumbers(), [1, 2, 3, 4, TOTAL_PAGES]);
  });

  await goToPage(4);
  await waitFor(() => {
    assert.deepEqual(queryVisiblePageNumbers(), [1, 3, 4, 5, TOTAL_PAGES]);
  });

  for (const targetPage of [5, 6, 7, 8, 9, 10, 11, 12]) {
    await goToPage(targetPage);
  }

  await waitFor(() => {
    assert.deepEqual(queryVisiblePageNumbers(), [1, 11, 12, 13, TOTAL_PAGES]);
  });

  await goToPage(TOTAL_PAGES);

  await waitFor(() => {
    assert.deepEqual(queryVisiblePageNumbers(), [
      1,
      TOTAL_PAGES - 3,
      TOTAL_PAGES - 2,
      TOTAL_PAGES - 1,
      TOTAL_PAGES,
    ]);
  });

  const updatedNextButton = screen.getByRole('button', { name: NEXT_PAGE_LABEL });
  assert.equal(updatedNextButton.hasAttribute('disabled'), true);

  const lastTrackButton = screen.getByRole('button', {
    name: 'Экстра трек 40 — Cherry RAiT',
  });
  assert.ok(lastTrackButton);

  fireEvent.click(screen.getByRole('button', { name: PREVIOUS_PAGE_LABEL }));

  await waitFor(() => {
    const pageButton = screen.getByRole('button', {
      name: `${PAGE_ARIA_LABEL} ${TOTAL_PAGES - 1}`,
    });
    assert.equal(pageButton.getAttribute('aria-current'), 'page');
  });
});

test('сбрасывает страницу после изменения поискового запроса', async () => {
  render(<KaraokePage />);

  await goToPage(6);

  const searchInput = await screen.findByLabelText('Поиск по трекам');

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

  assert.equal(queryNumericPaginationButtons().length, 0);

  fireEvent.change(searchInput, { target: { value: '' } });

  await waitFor(() => {
    const firstPageButton = screen.getByRole('button', {
      name: `${PAGE_ARIA_LABEL} 1`,
    });
    assert.equal(firstPageButton.getAttribute('aria-current'), 'page');
  });

  await waitFor(() => {
    assert.ok(screen.getByRole('button', { name: 'Неоновые сны — Cherry RAiT' }));
  });

  assert.equal(
    screen.queryByRole('button', { name: 'Звёздная пыль — Cherry RAiT' }),
    null,
  );
});

test('отображает очередь и добавляет треки в порядке кликов', async () => {
  render(<KaraokePage />);

  const firstTrackButton = await screen.findByRole('button', {
    name: 'Неоновые сны — Cherry RAiT',
  });
  fireEvent.click(firstTrackButton);

  const secondTrackButton = await screen.findByRole('button', {
    name: 'Огни большого города — Cherry RAiT',
  });
  fireEvent.click(secondTrackButton);

  await waitFor(() => {
    const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
    assert.equal(queueItems.length, 2);
  });

  const queueList = document.querySelector('.karaoke-page__queue-list');
  assert.ok(queueList);

  const queueTitles = Array.from(
    queueList.querySelectorAll('.karaoke-page__queue-track-title'),
  ).map((node) => node.textContent?.trim());

  assert.deepEqual(queueTitles, ['Неоновые сны', 'Огни большого города']);

  const video = await screen.findByLabelText('Воспроизведение: Неоновые сны');
  assert.equal(video.getAttribute('src'), sampleTracks[0].src);
});

test('добавляет трек в очередь при дропе на элемент плейлиста', async () => {
  render(<KaraokePage />);

  const firstTrackButton = await screen.findByRole('button', {
    name: 'Неоновые сны — Cherry RAiT',
  });
  fireEvent.click(firstTrackButton);

  await waitFor(() => {
    assert.equal(document.querySelectorAll('.karaoke-page__queue-item').length, 1);
  });

  const queueItem = document.querySelector('.karaoke-page__queue-item');
  assert.ok(queueItem);

  const targetTrackButton = screen.getByRole('button', {
    name: 'Огни большого города — Cherry RAiT',
  });
  const targetTrackItem = targetTrackButton.closest('.karaoke-page__track-item');
  assert.ok(targetTrackItem);

  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(queueItem, { dataTransfer });
  fireEvent.dragOver(targetTrackItem, { dataTransfer });
  fireEvent.drop(targetTrackItem, { dataTransfer });
  fireEvent.dragEnd(queueItem, { dataTransfer });

  await waitFor(() => {
    const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
    assert.equal(queueItems.length, 2);
  });

  const queueTitles = Array.from(
    document.querySelectorAll('.karaoke-page__queue-track-title'),
  ).map((node) => node.textContent?.trim());

  assert.deepEqual(queueTitles, ['Неоновые сны', 'Огни большого города']);
});

test('добавляет трек из плейлиста в очередь при дропе на зону очереди', async () => {
  render(<KaraokePage />);

  const firstTrackButton = await screen.findByRole('button', {
    name: 'Неоновые сны — Cherry RAiT',
  });
  fireEvent.click(firstTrackButton);

  await waitFor(() => {
    assert.equal(document.querySelectorAll('.karaoke-page__queue-item').length, 1);
    assert.ok(
      document.querySelector('.karaoke-page__queue-list .karaoke-page__list-drop-zone'),
    );
  });

  const playlistTrackButton = await screen.findByRole('button', {
    name: 'Огни большого города — Cherry RAiT',
  });
  const playlistTrackItem = playlistTrackButton.closest('.karaoke-page__track-item');
  assert.ok(playlistTrackItem);

  const dropZone = document.querySelector('.karaoke-page__queue-list .karaoke-page__list-drop-zone');
  assert.ok(dropZone);

  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(playlistTrackItem, { dataTransfer });
  fireEvent.dragOver(dropZone, { dataTransfer });
  fireEvent.drop(dropZone, { dataTransfer });
  fireEvent.dragEnd(playlistTrackItem, { dataTransfer });

  await waitFor(() => {
    const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
    assert.equal(queueItems.length, 2);
  });

  const queueTitles = Array.from(
    document.querySelectorAll('.karaoke-page__queue-track-title'),
  ).map((node) => node.textContent?.trim());

  assert.equal(
    queueTitles.filter((title) => title === 'Огни большого города').length,
    1,
  );
});

test('позволяет менять порядок очереди перетаскиванием', async () => {
  render(<KaraokePage />);

  const firstTrackButton = await screen.findByRole('button', {
    name: 'Неоновые сны — Cherry RAiT',
  });
  const secondTrackButton = await screen.findByRole('button', {
    name: 'Огни большого города — Cherry RAiT',
  });

  fireEvent.click(firstTrackButton);
  fireEvent.click(secondTrackButton);

  await goToPage(2);

  const thirdTrackButton = await screen.findByRole('button', {
    name: 'Ночной драйв — Cherry RAiT',
  });
  fireEvent.click(thirdTrackButton);

  await waitFor(() => {
    const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
    assert.equal(queueItems.length, 3);
  });

  const queueList = document.querySelector('.karaoke-page__queue-list');
  assert.ok(queueList);

  const queueElements = queueList.querySelectorAll('.karaoke-page__queue-item');
  const secondQueueElement = queueElements[1];
  const firstQueueElement = queueElements[0];
  const dataTransfer = createDataTransfer();

  fireEvent.dragStart(secondQueueElement, { dataTransfer });
  fireEvent.dragOver(firstQueueElement, { dataTransfer });
  fireEvent.drop(firstQueueElement, { dataTransfer });
  fireEvent.dragEnd(secondQueueElement, { dataTransfer });

  await waitFor(() => {
    const queueTitles = Array.from(
      queueList.querySelectorAll('.karaoke-page__queue-track-title'),
    ).map((node) => node.textContent?.trim());

    assert.deepEqual(queueTitles, [
      'Огни большого города',
      'Неоновые сны',
      'Ночной драйв',
    ]);
  });

  const videoAfterFirstReorder = await screen.findByLabelText(
    'Воспроизведение: Огни большого города',
  );
  assert.equal(videoAfterFirstReorder.getAttribute('src'), sampleTracks[1].src);

  const updatedQueueElements = queueList.querySelectorAll('.karaoke-page__queue-item');
  const firstQueueElementAfterReorder = updatedQueueElements[0];
  const listDropDataTransfer = createDataTransfer();
  const dropZone = queueList.querySelector('.karaoke-page__list-drop-zone');
  assert.ok(dropZone);

  fireEvent.dragStart(firstQueueElementAfterReorder, { dataTransfer: listDropDataTransfer });
  fireEvent.dragOver(dropZone, { dataTransfer: listDropDataTransfer });
  fireEvent.drop(dropZone, { dataTransfer: listDropDataTransfer });
  fireEvent.dragEnd(firstQueueElementAfterReorder, { dataTransfer: listDropDataTransfer });

  await waitFor(() => {
    const queueTitles = Array.from(
      queueList.querySelectorAll('.karaoke-page__queue-track-title'),
    ).map((node) => node.textContent?.trim());

    assert.deepEqual(queueTitles, [
      'Неоновые сны',
      'Ночной драйв',
      'Огни большого города',
    ]);
  });

  const videoAfterListDrop = await screen.findByLabelText('Воспроизведение: Неоновые сны');
  assert.equal(videoAfterListDrop.getAttribute('src'), sampleTracks[0].src);
});

test('переходит к следующему треку после завершения воспроизведения текущего', async () => {
  render(<KaraokePage />);

  const firstTrackButton = await screen.findByRole('button', {
    name: 'Неоновые сны — Cherry RAiT',
  });
  const secondTrackButton = await screen.findByRole('button', {
    name: 'Огни большого города — Cherry RAiT',
  });

  fireEvent.click(firstTrackButton);
  fireEvent.click(secondTrackButton);

  const video = await screen.findByLabelText('Воспроизведение: Неоновые сны');

  fireEvent(video, new window.Event('loadeddata'));
  fireEvent(video, new window.Event('ended'));

  await waitFor(() => {
    const queueItems = document.querySelectorAll('.karaoke-page__queue-item');
    assert.equal(queueItems.length, 1);
  });

  const nextVideo = await screen.findByLabelText('Воспроизведение: Огни большого города');
  assert.equal(nextVideo.getAttribute('src'), sampleTracks[1].src);
});
