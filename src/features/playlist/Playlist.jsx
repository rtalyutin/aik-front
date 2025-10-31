import React from 'react';
import Button from '../../components/Button.jsx';
import Tag from '../../components/Tag.jsx';
import playlistConfig from './config.json';
import './playlist.css';

const statusTags = playlistConfig.statusTags ?? {};
const defaultStatusTag = statusTags.default ?? { variant: 'neutral', label: '' };

const resolveStatusConfig = (track) => {
  const key = track.isError ? 'error' : track.statusStage ?? 'unknown';
  return statusTags[key] ?? defaultStatusTag;
};

const Playlist = ({
  tracks,
  selectedTrackId,
  onSelect,
  onAddClick,
  onRefresh,
  onRetry,
  notice,
  error,
  isAddDisabled = false,
  isRetryDisabled = false,
}) => {
  const { title, subtitle, addButton, columns, listLabel, actions, emptyState, selection } =
    playlistConfig;

  return (
    <section className="playlist" aria-label={title}>
      <header className="playlist__header">
        <div>
          <h1 className="playlist__title">{title}</h1>
          <p className="playlist__subtitle">{subtitle}</p>
        </div>
      </header>
      {notice && (
        <p className="playlist__notice workspace__notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="playlist__error workspace__error" role="alert">
          {error}
        </p>
      )}
      <div className="playlist__body" aria-live="polite">
        {tracks.length > 0 ? (
          <div className="playlist__content">
            <div className="playlist__columns" aria-hidden="true">
              {columns?.map((column) => (
                <span key={column.id} className={`playlist__column playlist__column--${column.id}`}>
                  {column.label}
                </span>
              ))}
            </div>
            <ul className="playlist__list" aria-label={listLabel}>
              {tracks.map((track) => {
                const statusConfig = resolveStatusConfig(track);
                const variant = track.tagVariant ?? statusConfig.variant ?? defaultStatusTag.variant ?? 'neutral';
                const statusLabel =
                  track.statusLabel || statusConfig.label || defaultStatusTag.label || '';
                const isActive = selectedTrackId === track.id;

                return (
                  <li
                    key={track.id}
                    className={`playlist__item${isActive ? ' playlist__item--active' : ''}`}
                  >
                    <div className="playlist__card">
                      <button
                        type="button"
                        className="playlist__select"
                        onClick={() => onSelect?.(track.id)}
                        aria-pressed={isActive}
                        aria-label={`${selection?.label ?? 'Выбрать трек'} ${track.id}`}
                      >
                        <div className="playlist__primary">
                          <span className="playlist__source" title={track.sourceUrl}>
                            {track.sourceUrl}
                          </span>
                          <span className="playlist__id">ID: {track.id}</span>
                        </div>
                        <div className="playlist__status">
                          <span className="playlist__status-icon" aria-hidden="true">
                            {track.statusIcon}
                          </span>
                          <Tag variant={variant} className="playlist__status-tag">
                            {statusLabel}
                          </Tag>
                          <span className="playlist__updated">
                            Обновлено: {track.updatedLabel || '—'}
                          </span>
                          {track.statusRaw && (
                            <span className="playlist__raw">API: {String(track.statusRaw)}</span>
                          )}
                        </div>
                        {track.statusMessage && (
                          <p className="playlist__message">{track.statusMessage}</p>
                        )}
                        {track.pollingError && (
                          <p className="playlist__polling-error" role="alert">
                            {track.pollingError}
                          </p>
                        )}
                      </button>
                      <div className="playlist__actions" aria-label="Действия с треком">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => onRefresh?.(track.id)}
                          disabled={track.isManualRefresh}
                        >
                          {track.isManualRefresh
                            ? 'Обновление…'
                            : actions?.refresh?.label ?? 'Обновить'}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onRetry?.(track.id)}
                          disabled={isRetryDisabled}
                        >
                          {actions?.retry?.label ?? 'Повторить'}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="playlist__empty">
            <h2 className="playlist__empty-title">{emptyState?.title}</h2>
            <p className="playlist__empty-description">{emptyState?.description}</p>
          </div>
        )}
      </div>
      <div className="playlist__footer">
        <Button
          type="button"
          onClick={onAddClick}
          disabled={isAddDisabled}
          icon={addButton?.icon ?? '+'}
          className="playlist__add-button"
        >
          {addButton?.label ?? 'Добавить трек'}
        </Button>
      </div>
    </section>
  );
};

export default Playlist;
