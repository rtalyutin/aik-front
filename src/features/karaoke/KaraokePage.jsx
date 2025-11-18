import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import karaokeConfig from './config.js';
import { useKaraokeTracks } from './useKaraokeTracks.js';

const KaraokePage = () => {
  const videoRef = useRef(null);
  const dragSourceIndexRef = useRef(null);
  const {
    tracks,
    isLoading,
    error,
    selectedTrack,
    selectedTrackId,
    selectTrack,
  } = useKaraokeTracks({ source: karaokeConfig.tracksSource });

  const [searchQuery, setSearchQuery] = useState('');
  const [queue, setQueue] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const paginationConfig = karaokeConfig.pagination || {};
  const paginationLabels = paginationConfig.labels || {};
  const pageSize = paginationConfig.pageSize || 6;
  const defaultMaxVisiblePages = 7;
  const parsedMaxVisiblePages = Number(paginationConfig.maxVisiblePages);
  const normalizedMaxVisiblePages = Number.isFinite(parsedMaxVisiblePages)
    ? Math.floor(parsedMaxVisiblePages)
    : defaultMaxVisiblePages;
  const maxVisiblePages = Math.max(
    normalizedMaxVisiblePages > 0 ? normalizedMaxVisiblePages : defaultMaxVisiblePages,
    3,
  );
  const previousPageLabel = paginationLabels.previous || 'Назад';
  const nextPageLabel = paginationLabels.next || 'Вперёд';
  const pageAriaLabel = paginationLabels.page || 'Страница';
  const paginationAriaLabel =
    paginationLabels.navigation || 'Навигация по страницам плейлиста';
  const [currentPage, setCurrentPage] = useState(1);

  const playlistHeading = karaokeConfig.tracksHeading || 'Плейлист';
  const playerHeading = karaokeConfig.playerHeading || 'Караоке-плеер';
  const queueHeading = karaokeConfig.queueHeading || 'Очередь воспроизведения';
  const queueEmptyState =
    karaokeConfig.queueEmptyState || 'Очередь пуста. Добавьте трек из плейлиста.';
  const queueInstructions = useMemo(() => {
    const instructions = karaokeConfig.queueInstructions;

    if (Array.isArray(instructions)) {
      return instructions
        .map((instruction) => String(instruction ?? '').trim())
        .filter((instruction) => instruction.length > 0);
    }

    if (typeof instructions === 'string') {
      const normalized = instructions.trim();

      return normalized ? [normalized] : [];
    }

    return [];
  }, []);
  const removeFromQueueLabel = karaokeConfig.queueRemoveLabel || 'Убрать из очереди';
  const loadingMessage = karaokeConfig.loadingMessage || 'Загрузка…';
  const emptyState = karaokeConfig.emptyState || 'Плейлист пока пуст.';
  const errorFallback = karaokeConfig.errorFallback || 'Не удалось загрузить треки.';
  const playerPlaceholder = karaokeConfig.playerPlaceholder || 'Выберите трек, чтобы начать.';
  const defaultCaptions = karaokeConfig.defaultCaptions || '';
  const playButtonLabel = karaokeConfig.playerPlayLabel || 'Воспроизвести';

  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleAddToQueue = useCallback(
    (trackId) => {
      if (!trackId) {
        return;
      }

      setQueue((previousQueue) => {
        const isKnownTrack = (tracks ?? []).some((track) => track.id === trackId);

        if (!isKnownTrack) {
          return previousQueue;
        }

        return [...previousQueue, trackId];
      });
    },
    [tracks],
  );

  const handleRemoveFromQueue = useCallback((indexToRemove) => {
    setQueue((previousQueue) => previousQueue.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleReorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue((previousQueue) => {
      const queueLength = previousQueue.length;

      if (queueLength <= 1) {
        return previousQueue;
      }

      const normalizedFromIndex = Number.isInteger(fromIndex) ? fromIndex : -1;
      const normalizedToIndex = Number.isInteger(toIndex) ? toIndex : Number.NaN;

      if (
        normalizedFromIndex < 0 ||
        normalizedFromIndex >= queueLength ||
        Number.isNaN(normalizedToIndex)
      ) {
        return previousQueue;
      }

      const clampedToIndex = Math.max(0, Math.min(normalizedToIndex, queueLength));

      if (normalizedFromIndex === clampedToIndex) {
        return previousQueue;
      }

      const nextQueue = [...previousQueue];
      const [movedItem] = nextQueue.splice(normalizedFromIndex, 1);
      const insertionIndex =
        clampedToIndex >= queueLength ? nextQueue.length : clampedToIndex;

      nextQueue.splice(insertionIndex, 0, movedItem);

      return nextQueue;
    });
  }, []);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setQueue((previousQueue) => previousQueue.slice(1));
  }, []);

  const handlePlayClick = useCallback(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    const playPromise = element.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, []);

  useEffect(() => {
    setIsVideoReady(false);
  }, [selectedTrackId]);

  useEffect(() => {
    if (!tracks || tracks.length === 0) {
      setQueue([]);
      return;
    }

    setQueue((previousQueue) =>
      previousQueue.filter((trackId) => (tracks ?? []).some((track) => track.id === trackId)),
    );
  }, [tracks]);

  useEffect(() => {
    if (!queue || queue.length === 0) {
      if (selectedTrackId) {
        selectTrack('');
      }

      return;
    }

    const nextTrackId = queue[0];

    if (nextTrackId && nextTrackId !== selectedTrackId) {
      selectTrack(nextTrackId);
    }
  }, [queue, selectTrack, selectedTrackId]);

  const filteredTracks = useMemo(() => {
    if (!tracks || tracks.length === 0) {
      return [];
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return tracks;
    }

    return tracks.filter((track) => {
      const title = String(track.title || '').toLowerCase();
      const artist = String(track.artist || '').toLowerCase();

      return title.includes(normalizedQuery) || artist.includes(normalizedQuery);
    });
  }, [tracks, searchQuery]);

  const totalPages = filteredTracks.length > 0 ? Math.ceil(filteredTracks.length / pageSize) : 0;

  const visiblePageNumbers = useMemo(() => {
    if (totalPages === 0) {
      return [];
    }

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const lastPage = totalPages;
    const pages = [];
    const middleSlots = maxVisiblePages - 2;
    const leftSlots = Math.floor(middleSlots / 2);
    const rightSlots = middleSlots - leftSlots;

    let start = currentPage - leftSlots;
    let end = currentPage + rightSlots - 1;

    if (start < 2) {
      start = 2;
      end = start + middleSlots - 1;
    }

    if (end > lastPage - 1) {
      end = lastPage - 1;
      start = end - middleSlots + 1;
    }

    pages.push(1);

    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      if (pageNumber > 1 && pageNumber < lastPage) {
        pages.push(pageNumber);
      }
    }

    pages.push(lastPage);

    return [...new Set(pages)].sort((a, b) => a - b).slice(0, maxVisiblePages);
  }, [currentPage, maxVisiblePages, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filteredTracks]);

  const goToPage = useCallback(
    (pageNumber) => {
      if (totalPages === 0) {
        return;
      }

      setCurrentPage((prevPage) => {
        const nextPage = Math.min(Math.max(pageNumber, 1), totalPages);

        if (nextPage === prevPage) {
          return prevPage;
        }

        return nextPage;
      });
    },
    [totalPages],
  );

  const handlePreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const paginatedTracks = useMemo(() => {
    if (!filteredTracks || filteredTracks.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredTracks.slice(startIndex, endIndex);
  }, [filteredTracks, currentPage, pageSize]);

  const queueEntries = useMemo(() => {
    return queue
      .map((trackId, position) => {
        const track = (tracks ?? []).find((item) => item.id === trackId);

        if (!track) {
          return null;
        }

        return {
          type: 'track',
          key: `queue-${track.id}-${position}`,
          track,
          isQueued: true,
          queueIndex: position,
          source: 'queue',
        };
      })
      .filter(Boolean);
  }, [queue, tracks]);

  const playlistEntries = useMemo(() => {
    if (!paginatedTracks || paginatedTracks.length === 0) {
      return [];
    }

    return paginatedTracks.map((track) => {
      const queueIndex = queue.findIndex((queueId) => queueId === track.id);

      return {
        type: 'track',
        key: `playlist-${track.id}`,
        track,
        isQueued: queueIndex !== -1,
        queueIndex: queueIndex !== -1 ? queueIndex : null,
        source: 'playlist',
      };
    });
  }, [paginatedTracks, queue]);

  const renderItems = useMemo(() => {
    const items = [];

    items.push({
      type: 'heading',
      key: 'playlist-heading',
      label: playlistHeading,
      section: 'playlist',
    });
    items.push(...playlistEntries);

    items.push({
      type: 'heading',
      key: 'queue-heading',
      label: queueHeading,
      section: 'queue',
    });

    if (queueInstructions.length > 0) {
      items.push({
        type: 'instructions',
        key: 'queue-instructions',
        instructions: queueInstructions,
      });
    }

    if (queueEntries.length > 0) {
      items.push(...queueEntries);
    } else {
      items.push({
        type: 'empty',
        key: 'queue-empty',
        message: queueEmptyState,
      });
    }

    return items;
  }, [
    playlistEntries,
    queueEntries,
    playlistHeading,
    queueHeading,
    queueEmptyState,
    queueInstructions,
  ]);

  const renderItemsWithIndex = useMemo(
    () =>
      renderItems.map((item, index) => ({
        ...item,
        renderIndex: index,
      })),
    [renderItems],
  );

  const handleListItemDragStart = useCallback((event, index) => {
    dragSourceIndexRef.current = index;
    setDraggingIndex(index);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }, []);

  const handleQueueItemDragOver = useCallback((event) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleQueueItemDrop = useCallback(
    (event, targetIndex) => {
      event.stopPropagation();
      event.preventDefault();

      const storedIndex = dragSourceIndexRef.current;
      let fromIndex = Number.isFinite(storedIndex) ? storedIndex : null;

      if (fromIndex === null && event.dataTransfer) {
        const rawValue = event.dataTransfer.getData('text/plain');
        const parsedValue = Number.parseInt(rawValue, 10);

        if (Number.isFinite(parsedValue)) {
          fromIndex = parsedValue;
        }
      }

      if (fromIndex === null) {
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      const sourceItem = renderItems[fromIndex];

      if (!sourceItem || sourceItem.type !== 'track') {
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      if (!sourceItem.isQueued) {
        handleAddToQueue(sourceItem.track.id);
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      const sourceQueueIndex = sourceItem.queueIndex ?? -1;

      if (sourceQueueIndex < 0) {
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      if (targetIndex === 'end') {
        handleReorderQueue(sourceQueueIndex, queue.length);
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      const targetItem = renderItems[targetIndex];

      if (!targetItem) {
        dragSourceIndexRef.current = null;
        setDraggingIndex(null);
        return;
      }

      if (targetItem.type === 'track' && targetItem.isQueued) {
        const targetQueueIndex = targetItem.queueIndex ?? -1;

        if (targetQueueIndex >= 0) {
          handleReorderQueue(sourceQueueIndex, targetQueueIndex);
        }
      } else if (targetItem.type === 'track' && !targetItem.isQueued) {
        handleAddToQueue(targetItem.track.id);
      }

      dragSourceIndexRef.current = null;
      setDraggingIndex(null);
    },
    [handleAddToQueue, handleReorderQueue, queue.length, renderItems],
  );

  const handleQueueItemDragEnd = useCallback(() => {
    dragSourceIndexRef.current = null;
    setDraggingIndex(null);
  }, []);

  return (
    <section
      className="workspace karaoke-page"
      aria-labelledby="karaoke-page-title"
      aria-describedby="karaoke-page-description"
    >
      <header className="karaoke-page__header">
        <h1 id="karaoke-page-title" className="karaoke-page__title">
          {karaokeConfig.title}
        </h1>
        <p id="karaoke-page-description" className="karaoke-page__description">
          {karaokeConfig.description}
        </p>
      </header>
      <div className="karaoke-page__content">
        <aside className="karaoke-page__playlist" aria-live="polite">
          <h2 className="karaoke-page__section-title">{playlistHeading}</h2>
          {isLoading ? (
            <p className="karaoke-page__status">{loadingMessage}</p>
          ) : null}
          {!isLoading && error ? (
            <p role="alert" className="karaoke-page__status karaoke-page__status--error">
              {error || errorFallback}
            </p>
          ) : null}
          {!isLoading && !error && (!tracks || tracks.length === 0) ? (
            <p className="karaoke-page__status">{emptyState}</p>
          ) : null}
          {tracks && tracks.length > 0 ? (
            <div className="karaoke-page__search">
              <label className="karaoke-page__search-label" htmlFor="karaoke-search-input">
                Поиск по трекам
              </label>
              <div className="karaoke-page__search-field">
                <span className="karaoke-page__search-icon" aria-hidden="true">
                  <svg
                    className="karaoke-page__search-icon-graphic"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    role="presentation"
                    focusable="false"
                  >
                    <path
                      d="M10.5 3.75a6.75 6.75 0 0 1 5.404 10.862l4.992 4.992a.75.75 0 0 1-1.06 1.061l-4.992-4.992A6.75 6.75 0 1 1 10.5 3.75Zm0 1.5a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="karaoke-search-input"
                  type="search"
                  className="karaoke-page__search-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Введите название или исполнителя"
                />
              </div>
            </div>
          ) : null}
          {tracks && tracks.length > 0 && filteredTracks.length === 0 ? (
            <p className="karaoke-page__status">Ничего не найдено</p>
          ) : null}
          {paginatedTracks.length > 0 ? (
            <ul className="karaoke-page__list karaoke-page__playlist-list">
              {renderItemsWithIndex.map((item) => {
                if (item.type !== 'track' || item.source !== 'playlist') {
                  return null;
                }

                const { track, isQueued, queueIndex, renderIndex } = item;
                const isActiveQueueItem = isQueued && queueIndex === 0;
                const buttonClasses = ['karaoke-page__track-button'];

                if (isActiveQueueItem) {
                  buttonClasses.push('karaoke-page__track-button--active');
                }

                const handleClick = () => {
                  if (isQueued && Number.isInteger(queueIndex)) {
                    handleRemoveFromQueue(queueIndex);
                  } else {
                    handleAddToQueue(track.id);
                  }
                };

                return (
                  <li
                    key={item.key || track.id}
                    className="karaoke-page__list-item karaoke-page__track-item"
                    draggable
                    onDragStart={(event) => handleListItemDragStart(event, renderIndex)}
                    onDragOver={handleQueueItemDragOver}
                    onDrop={(event) => handleQueueItemDrop(event, renderIndex)}
                    onDragEnd={handleQueueItemDragEnd}
                  >
                    <button
                      type="button"
                      className={buttonClasses.join(' ')}
                      onClick={handleClick}
                      aria-pressed={isQueued}
                    >
                      <span className="karaoke-page__track-title">{track.title}</span>
                      {track.artist ? (
                        <span className="karaoke-page__track-artist">— {track.artist}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          {tracks && tracks.length > 0 && filteredTracks.length > 0 ? (
            <>
              {totalPages > 1 ? (
                <nav
                  className="karaoke-page__pagination"
                  aria-label={paginationAriaLabel}
                >
                  <button
                    type="button"
                    className="karaoke-page__pagination-button karaoke-page__pagination-button--control"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    {previousPageLabel}
                  </button>
                  <ul className="karaoke-page__pagination-pages">
                    {visiblePageNumbers.map((pageNumber) => {
                      const isActivePage = currentPage === pageNumber;

                      return (
                        <li key={pageNumber} className="karaoke-page__pagination-page-item">
                          <button
                            type="button"
                            className={[
                              'karaoke-page__pagination-button',
                              'karaoke-page__pagination-button--number',
                              isActivePage
                                ? 'karaoke-page__pagination-button--active'
                                : null,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => goToPage(pageNumber)}
                            aria-label={`${pageAriaLabel} ${pageNumber}`}
                            aria-current={isActivePage ? 'page' : undefined}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <button
                    type="button"
                    className="karaoke-page__pagination-button karaoke-page__pagination-button--control"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    {nextPageLabel}
                  </button>
                </nav>
              ) : null}
            </>
          ) : null}
        </aside>
        <div className="karaoke-page__player">
          <h2 className="karaoke-page__section-title">{playerHeading}</h2>
          <div className="karaoke-page__queue" aria-live="polite">
            <div className="karaoke-page__queue-header">
              <h3 className="karaoke-page__queue-title">{queueHeading}</h3>
              {queueInstructions.length > 0 ? (
                <div className="karaoke-page__queue-instructions" role="presentation">
                  <ol className="karaoke-page__queue-instructions-list">
                    {queueInstructions.map((instruction, instructionIndex) => (
                      <li
                        key={`queue-instruction-${instructionIndex}`}
                        className="karaoke-page__queue-instructions-item"
                      >
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
            <ul
              className="karaoke-page__queue-list"
              onDragOver={queueEntries.length === 0 ? handleQueueItemDragOver : undefined}
              onDrop={
                queueEntries.length === 0
                  ? (event) => handleQueueItemDrop(event, 'end')
                  : undefined
              }
            >
              {renderItemsWithIndex.map((item) => {
                if (item.type !== 'track' || item.source !== 'queue') {
                  return null;
                }

                const { track, queueIndex, renderIndex, isQueued } = item;
                const isActiveQueueItem = isQueued && queueIndex === 0;
                const queueItemClasses = [
                  'karaoke-page__list-item',
                  'karaoke-page__queue-item',
                ];

                if (isActiveQueueItem) {
                  queueItemClasses.push('karaoke-page__queue-item--active');
                }

                if (draggingIndex === renderIndex) {
                  queueItemClasses.push('karaoke-page__queue-item--dragging');
                }

                return (
                  <li
                    key={item.key || track.id}
                    className={queueItemClasses.join(' ')}
                    draggable
                    onDragStart={(event) => handleListItemDragStart(event, renderIndex)}
                    onDragOver={handleQueueItemDragOver}
                    onDrop={(event) => handleQueueItemDrop(event, renderIndex)}
                    onDragEnd={handleQueueItemDragEnd}
                    aria-current={isActiveQueueItem ? 'true' : undefined}
                  >
                    <span className="karaoke-page__queue-track">
                      <span className="karaoke-page__queue-track-title">{track.title}</span>
                      {track.artist ? (
                        <span className="karaoke-page__queue-track-artist">— {track.artist}</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className="karaoke-page__queue-remove"
                      onClick={() =>
                        Number.isInteger(queueIndex) ? handleRemoveFromQueue(queueIndex) : null
                      }
                    >
                      {removeFromQueueLabel}
                    </button>
                  </li>
                );
              })}
              {queueEntries.length > 0 ? (
                <li
                  key="queue-drop-zone"
                  className="karaoke-page__list-drop-zone"
                  role="presentation"
                  onDragOver={handleQueueItemDragOver}
                  onDrop={(event) => handleQueueItemDrop(event, 'end')}
                  aria-hidden="true"
                />
              ) : (
                <li
                  key="queue-empty"
                  className="karaoke-page__list-item karaoke-page__queue-empty karaoke-page__list-empty"
                  role="presentation"
                >
                  {queueEmptyState}
                </li>
              )}
            </ul>
          </div>
          {selectedTrack ? (
            <>
              <video
                key={selectedTrack.id}
                ref={videoRef}
                className="karaoke-page__video"
                controls
                src={selectedTrack.src}
                onLoadedData={handleVideoReady}
                onEnded={handleVideoEnd}
                aria-label={`Воспроизведение: ${selectedTrack.title}`}
              >
                <track
                  kind="captions"
                  srcLang="ru"
                  label="Русские субтитры"
                  src={selectedTrack.captions || defaultCaptions}
                  default
                />
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
              <div className="karaoke-page__controls">
                <button
                  type="button"
                  className="karaoke-page__play-button"
                  onClick={handlePlayClick}
                  disabled={!isVideoReady}
                >
                  {playButtonLabel}
                </button>
              </div>
            </>
          ) : (
            <div className="karaoke-page__placeholder" aria-live="polite">
              {playerPlaceholder}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default KaraokePage;
