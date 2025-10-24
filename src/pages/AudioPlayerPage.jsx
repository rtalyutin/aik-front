import { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import styles from './audio-player-page.module.css'

const TRACKS = [
  {
    id: 'warmup',
    title: 'Warmup Anthem',
    duration: 182,
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2023/01/16/audio_2147d1039e.mp3?filename=sport-future-bass-133125.mp3',
    lyrics: [
      { time: 0, text: 'Разминка начинается, вдохни глубже.' },
      { time: 20, text: 'Команда собирается, ритм ускоряется.' },
      { time: 48, text: 'Каждый шаг уверен, каждый взгляд вперёд.' },
      { time: 75, text: 'Не сдавайся, бейся до конца.' },
      { time: 120, text: 'Победа близко — слышишь, как трибуны ревут?' },
    ],
  },
  {
    id: 'battle',
    title: 'Battle Formation',
    duration: 205,
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2023/04/05/audio_a9e1274695.mp3?filename=epicness-144334.mp3',
    lyrics: [
      { time: 0, text: 'В круге света мы готовим удар.' },
      { time: 30, text: 'Пульс ускорен — время действовать.' },
      { time: 58, text: 'Слаженно движемся, слышим зов арены.' },
      { time: 102, text: 'Тренер кричит: «Держим строй!»' },
      { time: 160, text: 'Финальный свисток уже на подходе.' },
    ],
  },
  {
    id: 'celebration',
    title: 'Celebration Lights',
    duration: 194,
    audioUrl:
      'https://cdn.pixabay.com/download/audio/2023/05/30/audio_b7a4756e6a.mp3?filename=energetic-sport-trap-146800.mp3',
    lyrics: [
      { time: 0, text: 'Искры летят под куполом арены.' },
      { time: 25, text: 'Мы на плечах у фанатов.' },
      { time: 60, text: 'Медали сияют, музыка гремит.' },
      { time: 110, text: 'Мы прошли весь путь — от мечты к победе.' },
      { time: 170, text: 'Запомним этот момент навсегда.' },
    ],
  },
]

const formatTime = (value) => {
  if (!Number.isFinite(value)) {
    return '0:00'
  }
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const findLyricIndex = (lyrics, time) => {
  if (!lyrics || lyrics.length === 0) {
    return -1
  }
  let current = -1
  for (const [index, lyric] of lyrics.entries()) {
    if (time >= lyric.time) {
      current = index
    } else {
      break
    }
  }
  return current
}

const AudioPlayerPage = () => {
  const audioRef = useRef(null)
  const [activeTrackId, setActiveTrackId] = useState(TRACKS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(TRACKS[0].duration)
  const [transpose, setTranspose] = useState(0)

  const activeTrack = useMemo(
    () => TRACKS.find((track) => track.id === activeTrackId) ?? TRACKS[0],
    [activeTrackId],
  )

  const currentLyricIndex = findLyricIndex(activeTrack.lyrics, currentTime)
  const currentLyric =
    currentLyricIndex >= 0 ? (activeTrack.lyrics.at(currentLyricIndex) ?? null) : null
  const previousLyric =
    currentLyricIndex > 0 ? (activeTrack.lyrics.at(currentLyricIndex - 1) ?? null) : null
  const nextLyric =
    currentLyricIndex >= 0 && currentLyricIndex < activeTrack.lyrics.length - 1
      ? (activeTrack.lyrics.at(currentLyricIndex + 1) ?? null)
      : null

  useEffect(() => {
    setCurrentTime(0)
    setDuration(activeTrack.duration)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [activeTrack])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) {
      return
    }

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audioElement.duration)) {
        setDuration(audioElement.duration)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const handleEnded = () => {
      const currentIndex = TRACKS.findIndex((track) => track.id === activeTrackId)
      const nextTrack = TRACKS.at((currentIndex + 1) % TRACKS.length) ?? TRACKS[0]
      setActiveTrackId(nextTrack.id)
      setIsPlaying(true)
    }

    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('ended', handleEnded)

    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('ended', handleEnded)
    }
  }, [activeTrackId])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) {
      return
    }

    if (isPlaying) {
      const promise = audioElement.play()
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {
          setIsPlaying(false)
        })
      }
    } else {
      audioElement.pause()
    }
  }, [isPlaying, activeTrackId])

  const handleSelectTrack = (trackId) => {
    setActiveTrackId(trackId)
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleSeek = (event) => {
    const { value } = event.target
    const newTime = Number(value)
    if (Number.isFinite(newTime) && audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handlePrevious = () => {
    const currentIndex = TRACKS.findIndex((track) => track.id === activeTrackId)
    const nextIndex = (currentIndex - 1 + TRACKS.length) % TRACKS.length
    const nextTrack = TRACKS.at(nextIndex) ?? TRACKS[TRACKS.length - 1]
    setActiveTrackId(nextTrack.id)
    setIsPlaying(true)
  }

  const handleNext = () => {
    const currentIndex = TRACKS.findIndex((track) => track.id === activeTrackId)
    const nextIndex = (currentIndex + 1) % TRACKS.length
    const nextTrack = TRACKS.at(nextIndex) ?? TRACKS[0]
    setActiveTrackId(nextTrack.id)
    setIsPlaying(true)
  }

  const handleTransposeChange = (delta) => {
    setTranspose((prev) => Math.min(12, Math.max(-12, prev + delta)))
  }

  const progressValue = duration ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div className={styles.wrapper}>
      <Helmet>
        <title>Аудиоплеер</title>
        <meta
          name="description"
          content="Музыкальное сопровождение для разминки, игры и празднования команды AIK Front."
        />
      </Helmet>
      <header className={styles.header}>
        <h1>Музыка AIK Front</h1>
        <p>
          Подборка треков для разминки, выхода на арену и празднования победы. Управляйте
          воспроизведением, следите за текстом и подстраивайте транспозицию под себя.
        </p>
      </header>
      <div className={styles.layout}>
        <section className={styles.trackList} aria-label="Список треков">
          <h2 className={styles.sectionTitle}>Треки</h2>
          <ol className={styles.list}>
            {TRACKS.map((track, index) => {
              const isActive = track.id === activeTrack.id
              return (
                <li key={track.id} className={isActive ? styles.activeTrack : undefined}>
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className={styles.trackButton}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    <span className={styles.trackIndex}>{index + 1}.</span>
                    <span className={styles.trackMeta}>
                      <span className={styles.trackTitle}>{track.title}</span>
                      <span className={styles.trackDuration}>{formatTime(track.duration)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
        <section className={styles.player} aria-label="Аудиоплеер">
          <div className={styles.nowPlaying}>
            <p className={styles.nowPlayingLabel}>Сейчас играет</p>
            <h2 className={styles.nowPlayingTitle}>{activeTrack.title}</h2>
          </div>
          <div className={styles.lyrics}>
            <p className={styles.previousLyric}>{previousLyric?.text ?? '—'}</p>
            <p className={styles.currentLyric} aria-live="polite">
              {currentLyric?.text ?? 'Начните воспроизведение, чтобы увидеть текст.'}
            </p>
            <p className={styles.nextLyric}>{nextLyric?.text ?? '—'}</p>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.progressMeta}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ '--progress': `${progressValue}%` }} />
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                aria-label="Позиция воспроизведения"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={Math.round(currentTime)}
                onChange={handleSeek}
                className={styles.progressControl}
              />
            </div>
          </div>
          <div className={styles.controls}>
            <button type="button" onClick={handlePrevious} className={styles.controlButton}>
              ◀ Предыдущий
            </button>
            <button type="button" onClick={handlePlayPause} className={styles.controlButtonPrimary}>
              {isPlaying ? '⏸ Пауза' : '▶ Старт'}
            </button>
            <button type="button" onClick={handleNext} className={styles.controlButton}>
              Следующий ▶
            </button>
          </div>
          <div className={styles.transposeControls}>
            <p className={styles.transposeLabel}>
              Транспонирование: {transpose >= 0 ? '+' : ''}
              {transpose}
            </p>
            <div className={styles.transposeButtons}>
              <button
                type="button"
                onClick={() => handleTransposeChange(-1)}
                className={styles.controlButton}
                aria-label="Уменьшить транспонирование"
              >
                − Полутон
              </button>
              <button
                type="button"
                onClick={() => handleTransposeChange(1)}
                className={styles.controlButton}
                aria-label="Увеличить транспонирование"
              >
                + Полутон
              </button>
            </div>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio
            ref={audioRef}
            src={activeTrack.audioUrl}
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        </section>
      </div>
    </div>
  )
}

export default AudioPlayerPage
