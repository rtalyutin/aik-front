import React, { useCallback, useEffect, useMemo } from 'react';
import playerConfig from './config.json';
import { usePlayback } from './PlaybackProvider.jsx';
import './player.css';

const formatTime = (value) => {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const defaultTrack = {
  id: playerConfig.track?.id ?? 'track',
  title: playerConfig.track?.title ?? 'Demo',
  artist: playerConfig.track?.artist ?? '',
  src: playerConfig.track?.src ?? '',
  captions: playerConfig.track?.captions ?? null,
};

function Player() {
  const {
    audioRef,
    currentTime,
    duration,
    isPlaying,
    pause,
    play,
    progress,
    seek,
    setTrack,
    track,
  } = usePlayback();

  const captionSettings = useMemo(
    () => track?.captions ?? defaultTrack.captions ?? null,
    [track],
  );

  useEffect(() => {
    if (!track) {
      setTrack(defaultTrack);
      return;
    }

    const isDifferent =
      track.id !== defaultTrack.id ||
      track.src !== defaultTrack.src ||
      track.title !== defaultTrack.title ||
      (track.artist ?? '') !== (defaultTrack.artist ?? '') ||
      (track.captions?.src ?? '') !== (defaultTrack.captions?.src ?? '');

    if (isDifferent) {
      setTrack(defaultTrack);
    }
  }, [setTrack, track]);

  const handleTogglePlayback = useCallback(() => {
    if (!track?.src) {
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play, track]);

  const handleSeek = useCallback(
    (event) => {
      const nextValue = Number(event.target.value);

      if (Number.isFinite(nextValue)) {
        seek(nextValue);
      }
    },
    [seek],
  );

  const clampedProgress = useMemo(() => Math.round(progress * 100), [progress]);
  const disabled = !track?.src;

  return (
    <section className="player" aria-label={playerConfig.title ?? 'Аудиоплеер'}>
      <header className="player__header">
        <div>
          <h2 className="player__title">{playerConfig.title ?? 'Аудиоплеер'}</h2>
          <p className="player__description">{playerConfig.description}</p>
        </div>
        {track?.title && (
          <dl className="player__meta">
            <div>
              <dt className="player__meta-term">Трек</dt>
              <dd className="player__meta-value">{track.title}</dd>
            </div>
            {track.artist && (
              <div>
                <dt className="player__meta-term">Исполнитель</dt>
                <dd className="player__meta-value">{track.artist}</dd>
              </div>
            )}
          </dl>
        )}
      </header>
      <audio
        ref={audioRef}
        src={track?.src ?? ''}
        preload="metadata"
        data-testid="player-audio"
        aria-label="Аудиотрек"
      >
        <track
          kind="captions"
          src={captionSettings?.src ?? 'data:,'}
          srcLang={captionSettings?.srclang ?? 'ru'}
          label={captionSettings?.label ?? 'Субтитры'}
          default
        />
      </audio>
      <div className="player__controls">
        <button type="button" onClick={handleTogglePlayback} disabled={disabled} className="player__button">
          {isPlaying ? 'Пауза' : 'Воспроизвести'}
        </button>
        <div className="player__time" aria-live="off">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="player__seek">
        <input
          className="player__slider"
          type="range"
          min="0"
          max={Number.isFinite(duration) && duration > 0 ? duration : 0}
          step={playerConfig.controls?.seekStepSeconds ?? 0.1}
          value={Number.isFinite(duration) && duration > 0 ? currentTime : 0}
          onChange={handleSeek}
          disabled={disabled || !Number.isFinite(duration) || duration === 0}
          aria-label="Перемотка трека"
        />
        <div
          className="player__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
          aria-label="Прогресс воспроизведения"
        >
          <span style={{ width: `${clampedProgress}%` }} className="player__progress-indicator" />
        </div>
      </div>
    </section>
  );
}

export default Player;
