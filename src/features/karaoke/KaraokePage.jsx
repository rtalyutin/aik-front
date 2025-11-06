import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import karaokeConfig from './config.json';
import { useKaraokeTracks } from './useKaraokeTracks.js';

const KaraokePage = () => {
  const videoRef = useRef(null);
  const {
    tracks,
    isLoading,
    error,
    selectedTrack,
    selectedTrackId,
    selectTrack,
  } = useKaraokeTracks({ source: karaokeConfig.tracksSource });

  const [searchQuery, setSearchQuery] = useState('');
  const paginationConfig = karaokeConfig.pagination || {};
  const paginationLabels = paginationConfig.labels || {};
  const pageSize = paginationConfig.pageSize || 6;
  const previousPageLabel = paginationLabels.previous || 'Назад';
  const nextPageLabel = paginationLabels.next || 'Вперёд';
  const pageAriaLabel = paginationLabels.page || 'Страница';
  const paginationAriaLabel =
    paginationLabels.navigation || 'Навигация по страницам плейлиста';
  const [currentPage, setCurrentPage] = useState(1);

  const playlistHeading = karaokeConfig.tracksHeading || 'Плейлист';
  const playerHeading = karaokeConfig.playerHeading || 'Караоке-плеер';
  const loadingMessage = karaokeConfig.loadingMessage || 'Загрузка…';
  const emptyState = karaokeConfig.emptyState || 'Плейлист пока пуст.';
  const errorFallback = karaokeConfig.errorFallback || 'Не удалось загрузить треки.';
  const playerPlaceholder = karaokeConfig.playerPlaceholder || 'Выберите трек, чтобы начать.';
  const defaultCaptions = karaokeConfig.defaultCaptions || '';

  const handleTrackSelect = useCallback(
    (trackId) => {
      selectTrack(trackId);
    },
    [selectTrack],
  );

  const handleVideoLoaded = useCallback(() => {
    if (!selectedTrack) {
      return;
    }

    const element = videoRef.current;

    if (!element) {
      return;
    }

    const playPromise = element.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [selectedTrack]);

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

  const trackButtons = useMemo(() => {
    if (!paginatedTracks || paginatedTracks.length === 0) {
      return null;
    }

    return paginatedTracks.map((track) => {
      const isActive = selectedTrackId === track.id;
      const buttonClasses = ['karaoke-page__track-button'];

      if (isActive) {
        buttonClasses.push('karaoke-page__track-button--active');
      }

      return (
        <li key={track.id} className="karaoke-page__track-item">
          <button
            type="button"
            className={buttonClasses.join(' ')}
            onClick={() => handleTrackSelect(track.id)}
            aria-pressed={isActive}
          >
            <span className="karaoke-page__track-title">{track.title}</span>
            {track.artist ? (
              <span className="karaoke-page__track-artist">— {track.artist}</span>
            ) : null}
          </button>
        </li>
      );
    });
  }, [paginatedTracks, selectedTrackId, handleTrackSelect]);

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
          {tracks && tracks.length > 0 && filteredTracks.length > 0 ? (
            <>
              <ul className="karaoke-page__track-list">{trackButtons}</ul>
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
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
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
          {selectedTrack ? (
            <video
              key={selectedTrack.id}
              ref={videoRef}
              className="karaoke-page__video"
              controls
              src={selectedTrack.src}
              onLoadedData={handleVideoLoaded}
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
