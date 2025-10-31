import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import Button from './components/Button';
import Modal from './components/Modal';
import jobStatusConfig from './features/job-status/config.json';
import {
  appendHistoryEntry,
  normalizeJobStage,
  resolveStatusFromPayload,
} from './features/job-status/statusUtils';
import Uploader from './features/uploader/Uploader';
import uploaderConfig from './features/uploader/config.json';
import { PlaybackProvider } from './features/player/PlaybackProvider.jsx';
import Player from './features/player/Player.jsx';
import Lyrics from './features/lyrics/Lyrics.jsx';

const uploaderMessages = uploaderConfig.messages ?? {};
const createJobEndpoint = uploaderConfig.api?.createJobEndpoint ?? '/api/jobs';
const statusEndpointBase = jobStatusConfig.api?.statusEndpoint ?? '/api/jobs';
const pollingIntervalMs = jobStatusConfig.polling?.intervalMs ?? 5000;
const maxPollingAttempts = jobStatusConfig.polling?.maxAttempts ?? 120;
const statusIconsConfig = jobStatusConfig.icons ?? {};

const defaultStatusIcons = {
  uploading: '⬆️',
  splitting: '🪄',
  transcribing: '🎙️',
  complete: '✅',
  error: '⚠️',
  unknown: '❔',
};

const extractJobId = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const candidates = [
    'uuid',
    'jobUuid',
    'jobUUID',
    'jobId',
    'id',
    'job_id',
    'job_uuid',
  ];

  for (const key of candidates) {
    if (payload[key]) {
      return String(payload[key]);
    }
  }

  if (payload.data && typeof payload.data === 'object') {
    for (const key of candidates) {
      if (payload.data[key]) {
        return String(payload.data[key]);
      }
    }
  }

  return '';
};

const getStatusEndpoint = (uuid) => {
  const safeUuid = encodeURIComponent(uuid);
  return `${statusEndpointBase.replace(/\/$/, '')}/${safeUuid}`;
};

const extractMessageFromPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  return (
    payload.message ??
    payload.detail ??
    payload.statusMessage ??
    payload.status_message ??
    payload.error ??
    ''
  );
};

const formatTimestamp = (value) => {
  if (!value) {
    return '';
  }

  try {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch (error) {
    return '';
  }
};

function App() {
  const [theme, setTheme] = useState('light');
  const [accentPreset, setAccentPreset] = useState('pink');
  const [tracks, setTracks] = useState([]);
  const [globalNotice, setGlobalNotice] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [lastSourceUrl, setLastSourceUrl] = useState('');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const pollAttemptsRef = useRef(new Map());
  const pollingTimersRef = useRef(new Map());
  const tracksRef = useRef([]);

  const statusIcons = useMemo(() => ({ ...defaultStatusIcons, ...statusIconsConfig }), []);

  const stepsById = useMemo(() => {
    const map = new Map();
    const steps = jobStatusConfig.steps ?? [];

    steps.forEach((step) => {
      map.set(step.id, step);
    });

    return map;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accentPreset;
    const rootNode = document.getElementById('root');

    if (rootNode) {
      rootNode.dataset.accent = accentPreset;
    }
  }, [accentPreset]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const stopPolling = useCallback((jobId) => {
    if (!jobId) {
      return;
    }

    const timer = pollingTimersRef.current.get(jobId);

    if (timer) {
      clearInterval(timer);
      pollingTimersRef.current.delete(jobId);
    }

    pollAttemptsRef.current.delete(jobId);
  }, []);

  const fetchJobStatus = useCallback(
    async (uuid, { manual = false } = {}) => {
      if (!uuid) {
        return null;
      }

      if (manual) {
        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track.id === uuid
              ? {
                  ...track,
                  isManualRefresh: true,
                  pollingError: '',
                }
              : track,
          ),
        );
      }

      try {
        const response = await fetch(getStatusEndpoint(uuid), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Не удалось получить статус (HTTP ${response.status}).`);
        }

        const payload = await response.json();
        const statusValue = resolveStatusFromPayload(payload);
        const normalized = normalizeJobStage(statusValue);
        const timestamp = Date.now();

        setTracks((prevTracks) =>
          prevTracks.map((track) => {
            if (track.id !== uuid) {
              return track;
            }

            const nextHistory = appendHistoryEntry(track.history, {
              stage: normalized.stage,
              rawStatus: statusValue ?? null,
              timestamp,
              isError: normalized.isError,
            });

            return {
              ...track,
              status: {
                ...normalized,
                rawStatus: statusValue ?? null,
                message: extractMessageFromPayload(payload),
                payload,
              },
              history: nextHistory,
              lastUpdatedAt: new Date(timestamp),
              isPolling: manual ? track.isPolling : !normalized.isFinal,
              pollingError: '',
              isManualRefresh: false,
            };
          }),
        );

        if (normalized.isFinal) {
          stopPolling(uuid);
        }

        return { normalized, payload };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось обновить статус.';
        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track.id === uuid
              ? {
                  ...track,
                  pollingError: message,
                  isPolling: false,
                  isManualRefresh: false,
                }
              : track,
          ),
        );
        stopPolling(uuid);

        if (manual) {
          throw error;
        }

        return null;
      }
    },
    [stopPolling],
  );

  const startPolling = useCallback(
    (jobId) => {
      if (!jobId) {
        return;
      }

      stopPolling(jobId);
      pollAttemptsRef.current.set(jobId, 0);

      const poll = async () => {
        const attempt = (pollAttemptsRef.current.get(jobId) ?? 0) + 1;
        pollAttemptsRef.current.set(jobId, attempt);

        const result = await fetchJobStatus(jobId);

        if (!result) {
          return;
        }

        if (result.normalized?.isFinal) {
          stopPolling(jobId);
          return;
        }

        if (maxPollingAttempts > 0 && attempt >= maxPollingAttempts) {
          stopPolling(jobId);
          setTracks((prevTracks) =>
            prevTracks.map((track) =>
              track.id === jobId
                ? {
                    ...track,
                    isPolling: false,
                    pollingError: 'Достигнут предел попыток обновления статуса.',
                  }
                : track,
            ),
          );
        }
      };

      poll();

      const intervalId = setInterval(() => {
        poll();
      }, pollingIntervalMs);

      pollingTimersRef.current.set(jobId, intervalId);
    },
    [fetchJobStatus, stopPolling],
  );

  const createJob = useCallback(
    async (sourceUrl, options = {}) => {
      const { messageOverride, replaceTrackId } = options;
      const trimmedUrl = sourceUrl.trim();

      setIsCreatingJob(true);
      setGlobalError('');
      setGlobalNotice('');

      try {
        const response = await fetch(createJobEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sourceUrl: trimmedUrl }),
        });

        if (!response.ok) {
          throw new Error(`Не удалось создать задачу (HTTP ${response.status}).`);
        }

        const payload = await response.json();
        const newJobId = extractJobId(payload);

        if (!newJobId) {
          throw new Error('Ответ сервера не содержит идентификатор задачи.');
        }

        const statusValue = resolveStatusFromPayload(payload);
        const normalized = normalizeJobStage(statusValue);
        const timestamp = Date.now();

        const baseMessage = messageOverride ?? uploaderMessages.success ?? 'Задача успешно создана.';
        const statusDetails = statusValue ? ` (статус: ${statusValue})` : '';
        setGlobalNotice(`${baseMessage} ID: ${newJobId}${statusDetails}`);
        setLastSourceUrl(trimmedUrl);

        const newTrack = {
          id: newJobId,
          sourceUrl: trimmedUrl,
          status: {
            ...normalized,
            rawStatus: statusValue ?? null,
            message: extractMessageFromPayload(payload),
            payload,
          },
          history: appendHistoryEntry([], {
            stage: normalized.stage,
            rawStatus: statusValue ?? 'created',
            timestamp,
            isError: normalized.isError,
          }),
          lastUpdatedAt: new Date(timestamp),
          isPolling: !normalized.isFinal,
          pollingError: '',
          isManualRefresh: false,
        };

        if (replaceTrackId) {
          stopPolling(replaceTrackId);
        }

        setTracks((prevTracks) => {
          const filtered = prevTracks.filter((track) => track.id !== newJobId && track.id !== replaceTrackId);
          return [newTrack, ...filtered];
        });

        if (!normalized.isFinal) {
          startPolling(newJobId);
        } else {
          stopPolling(newJobId);
        }

        return { jobId: newJobId, payload };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Не удалось создать задачу.';
        setGlobalError(message);
        throw error;
      } finally {
        setIsCreatingJob(false);
      }
    },
    [startPolling, stopPolling],
  );

  const handleUploaderSubmit = useCallback(
    async (sourceUrl) => {
      try {
        await createJob(sourceUrl);
        setIsUploaderOpen(false);
      } catch (error) {
        // Ошибка уже обработана через глобальное состояние и Uploader
      }
    },
    [createJob],
  );

  const handleManualRefresh = useCallback(
    async (trackId) => {
      try {
        await fetchJobStatus(trackId, { manual: true });
      } catch (error) {
        // Ошибка уже отображена в состоянии трека
      }
    },
    [fetchJobStatus],
  );

  const handleRestart = useCallback(
    async (trackId) => {
      const track = tracksRef.current.find((item) => item.id === trackId);

      if (!track || !track.sourceUrl) {
        setGlobalError('Нет исходной ссылки для повторного запуска.');
        return;
      }

      try {
        await createJob(track.sourceUrl, { messageOverride: uploaderMessages.restart, replaceTrackId: trackId });
      } catch (error) {
        // Ошибка уже обработана в createJob
      }
    },
    [createJob],
  );

  const cleanupPolling = useCallback(() => {
    pollingTimersRef.current.forEach((timer) => {
      clearInterval(timer);
    });
    pollingTimersRef.current.clear();
    pollAttemptsRef.current.clear();
  }, []);

  useEffect(() => () => {
    cleanupPolling();
  }, [cleanupPolling]);

  const getStatusLabel = useCallback(
    (status) => {
      if (!status) {
        return 'Статус не получен';
      }

      if (status.isUnknown) {
        return 'Неизвестный статус';
      }

      const step = stepsById.get(status.stage);

      if (status.isError) {
        return step?.errorLabel ?? 'Ошибка обработки';
      }

      return step?.label ?? 'Статус обновляется';
    },
    [stepsById],
  );

  const getStatusIcon = useCallback(
    (status) => {
      if (!status) {
        return statusIcons.unknown ?? defaultStatusIcons.unknown;
      }

      const key = status.isError ? 'error' : status.stage ?? 'unknown';
      return statusIcons[key] ?? statusIcons.unknown ?? defaultStatusIcons.unknown;
    },
    [statusIcons],
  );

  const statusSummary = useMemo(() => {
    if (tracks.length === 0) {
      return 'Нет активных задач';
    }

    const active = tracks.find((track) => !track.status?.isFinal || track.status?.isError);

    if (!active) {
      return 'Все задачи завершены';
    }

    if (active.status?.isError) {
      return 'Есть задачи с ошибками';
    }

    return 'Выполняется обработка задач';
  }, [tracks]);

  return (
    <div
      className="app"
      data-theme={theme}
      data-accent={accentPreset}
      data-testid="app-shell"
      aria-live="polite"
      aria-label={statusSummary}
    >
      <Header
        theme={theme}
        accentPreset={accentPreset}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        onSelectAccent={setAccentPreset}
      />
      <main className="workspace" aria-label="Список треков и управление загрузками">
        <section className="workspace__toolbar">
          <div>
            <h1 className="workspace__title">Треки для обработки</h1>
            <p className="workspace__subtitle">Добавляйте новые треки и следите за статусом обработки.</p>
          </div>
          <Button type="button" onClick={() => setIsUploaderOpen(true)}>
            Добавить трек
          </Button>
        </section>
        {globalNotice && (
          <p className="workspace__notice" role="status">
            {globalNotice}
          </p>
        )}
        {globalError && (
          <p className="workspace__error" role="alert">
            {globalError}
          </p>
        )}
        {tracks.length > 0 ? (
          <ul className="track-list" aria-label="Список треков">
            {tracks.map((track) => {
              const statusLabel = getStatusLabel(track.status);
              const statusIcon = getStatusIcon(track.status);
              const iconKey = track.status?.isError ? 'error' : track.status?.stage ?? 'unknown';

              return (
                <li key={track.id} className="track-list__item">
                  <span
                    className={`track-list__status track-list__status--${iconKey}`}
                    aria-label={statusLabel}
                    title={statusLabel}
                  >
                    {statusIcon}
                  </span>
                  <div className="track-list__body">
                    <div className="track-list__row">
                      <div className="track-list__primary">
                        <span className="track-list__source" title={track.sourceUrl}>
                          {track.sourceUrl}
                        </span>
                        <span className="track-list__job" aria-label="Идентификатор задачи">
                          ID: {track.id}
                        </span>
                      </div>
                      <div className="track-list__meta" aria-live="polite">
                        <span className="track-list__stage">{statusLabel}</span>
                        <span className="track-list__updated">
                          Обновлено: {formatTimestamp(track.lastUpdatedAt) || '—'}
                        </span>
                        {track.status?.rawStatus && (
                          <span className="track-list__raw">API: {String(track.status.rawStatus)}</span>
                        )}
                      </div>
                    </div>
                    {track.status?.message && (
                      <p className="track-list__message">{track.status.message}</p>
                    )}
                    {track.pollingError && (
                      <p className="track-list__error" role="alert">
                        {track.pollingError}
                      </p>
                    )}
                  </div>
                  <div className="track-list__actions">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleManualRefresh(track.id)}
                      disabled={track.isManualRefresh}
                    >
                      {track.isManualRefresh ? 'Обновление…' : 'Обновить'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleRestart(track.id)}
                      disabled={isCreatingJob}
                    >
                      Повторить
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="track-list__empty">Треки ещё не загружены. Добавьте первый трек, чтобы начать обработку.</p>
        )}
        <PlaybackProvider>
          <section className="workspace__playback" aria-label="Прослушивание и синхронизация текста">
            <Player />
            <Lyrics />
          </section>
        </PlaybackProvider>
      </main>
      {isUploaderOpen && (
        <Modal onClose={() => setIsUploaderOpen(false)} labelledBy="uploader-title">
          <Uploader
            onCreateJob={handleUploaderSubmit}
            isCreating={isCreatingJob}
            initialUrl={lastSourceUrl}
            onCancel={() => setIsUploaderOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
