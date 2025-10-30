import React, { useEffect, useMemo, useRef } from 'react';
import lyricsConfig from './config.json';
import { usePlayback } from '../player/PlaybackProvider.jsx';
import './lyrics.css';

const getActiveIndex = (items, timeMs) => {
  if (!Array.isArray(items) || items.length === 0) {
    return -1;
  }

  let activeIndex = -1;

  for (let index = 0; index < items.length; index += 1) {
    const current = items[index];
    const next = items[index + 1];

    if (timeMs >= current.timeMs && (!next || timeMs < next.timeMs)) {
      activeIndex = index;
      break;
    }
  }

  return activeIndex;
};

function Lyrics() {
  const {
    currentTime,
    lyricsOffsetMs,
    setLyricsOffsetMs,
    track,
  } = usePlayback();

  const lineRefs = useRef([]);
  const effectiveTimeMs = currentTime * 1000 + lyricsOffsetMs;
  const lines = useMemo(() => lyricsConfig.lines ?? [], []);

  const activeLineIndex = useMemo(() => getActiveIndex(lines, effectiveTimeMs), [lines, effectiveTimeMs]);

  const activeWordIndex = useMemo(() => {
    if (activeLineIndex < 0) {
      return -1;
    }

    const words = lines[activeLineIndex]?.words ?? [];
    return getActiveIndex(words, effectiveTimeMs);
  }, [activeLineIndex, effectiveTimeMs, lines]);

  useEffect(() => {
    if (lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex]);

  const hasAppliedDefaultOffset = useRef(false);

  useEffect(() => {
    if (!hasAppliedDefaultOffset.current) {
      hasAppliedDefaultOffset.current = true;
      setLyricsOffsetMs(lyricsConfig.defaultOffsetMs ?? 0);
    }
  }, [setLyricsOffsetMs]);

  const handleDecreaseOffset = () => {
    setLyricsOffsetMs((prev) => prev - (lyricsConfig.offsetStepMs ?? 100));
  };

  const handleIncreaseOffset = () => {
    setLyricsOffsetMs((prev) => prev + (lyricsConfig.offsetStepMs ?? 100));
  };

  const handleOffsetInputChange = (event) => {
    const nextValue = Number(event.target.value);

    if (Number.isFinite(nextValue)) {
      setLyricsOffsetMs(nextValue);
    }
  };

  return (
    <section className="lyrics" aria-live="polite" aria-label={lyricsConfig.title ?? 'Текст композиции'}>
      <header className="lyrics__header">
        <div>
          <h2 className="lyrics__title">{lyricsConfig.title}</h2>
          <p className="lyrics__description">{lyricsConfig.description}</p>
        </div>
        <div className="lyrics__offset">
          <span className="lyrics__offset-label">Смещение, мс</span>
          <div className="lyrics__offset-controls">
            <button type="button" onClick={handleDecreaseOffset} className="lyrics__offset-button">
              −{lyricsConfig.offsetStepMs ?? 100}
            </button>
            <input
              className="lyrics__offset-input"
              type="number"
              value={lyricsOffsetMs}
              onChange={handleOffsetInputChange}
              aria-label="Настройка смещения текста"
            />
            <button type="button" onClick={handleIncreaseOffset} className="lyrics__offset-button">
              +{lyricsConfig.offsetStepMs ?? 100}
            </button>
          </div>
        </div>
      </header>
      <div className="lyrics__body">
        <ul className="lyrics__list" aria-label={`Строки для трека ${track?.title ?? ''}`}>
          {lines.map((line, index) => {
            const isActiveLine = index === activeLineIndex;
            const words = line.words ?? [];

            return (
              <li
                key={line.id}
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                className={`lyrics__line${isActiveLine ? ' lyrics__line--active' : ''}`}
                aria-current={isActiveLine ? 'true' : undefined}
              >
                <p className="lyrics__text">
                  {words.length > 0
                    ? words.map((word, wordIndex) => {
                        const isActiveWord = isActiveLine && wordIndex === activeWordIndex;
                        return (
                          <span
                            key={word.id}
                            className={`lyrics__word${isActiveWord ? ' lyrics__word--active' : ''}`}
                            aria-current={isActiveWord ? 'true' : undefined}
                          >
                            {word.text}
                            {wordIndex < words.length - 1 ? ' ' : ''}
                          </span>
                        );
                      })
                    : line.text}
                </p>
                <span className="lyrics__timestamp" aria-hidden="true">
                  {(line.timeMs / 1000).toFixed(1)}s
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Lyrics;
