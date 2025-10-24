import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import TrackList from '../player/TrackList.jsx'
import PlayerControls from '../player/PlayerControls.jsx'
import LyricsPanel from '../player/LyricsPanel.jsx'
import tracksConfig from '../player/config.json'
import playerStyles from '../player/player.module.css'
import styles from './playerPage.module.css'

const MIN_PITCH = -2
const MAX_PITCH = 2

const PlayerPage = () => {
  const tracks = tracksConfig.tracks
  const fallbackTrack = tracks.at(0)
  const [currentTrackId, setCurrentTrackId] = useState(() => fallbackTrack?.id ?? '')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [pitchShift, setPitchShift] = useState(0)
  const audioRef = useRef(null)

  const currentTrackIndex = useMemo(
    () => tracks.findIndex((track) => track.id === currentTrackId),
    [tracks, currentTrackId],
  )

  const currentTrack = useMemo(() => {
    if (currentTrackIndex >= 0) {
      return tracks.at(currentTrackIndex) ?? fallbackTrack
    }

    return fallbackTrack
  }, [currentTrackIndex, fallbackTrack, tracks])

  const handleNext = useCallback(() => {
    if (tracks.length === 0) {
      return
    }

    setCurrentTrackId((previousId) => {
      const index = tracks.findIndex((track) => track.id === previousId)
      const nextIndex = index >= 0 ? (index + 1) % tracks.length : 0
      const nextTrack = tracks.at(nextIndex)
      return nextTrack?.id ?? previousId
    })
    setIsPlaying(true)
  }, [tracks])

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) {
      return
    }

    setCurrentTrackId((previousId) => {
      const index = tracks.findIndex((track) => track.id === previousId)
      const nextIndex = index > 0 ? index - 1 : tracks.length - 1
      const nextTrack = tracks.at(nextIndex)
      return nextTrack?.id ?? previousId
    })
    setIsPlaying(true)
  }, [tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleNext)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleNext)
    }
  }, [handleNext])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.currentTime = 0
    setCurrentTime(0)
    setPitchShift(0)
    audio.playbackRate = 1
  }, [currentTrackId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const rate = Math.pow(2, pitchShift / 12)
    audio.playbackRate = rate
  }, [pitchShift])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (isPlaying) {
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setIsPlaying(false)
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrackId])

  const handleSelectTrack = useCallback((trackId) => {
    setCurrentTrackId(trackId)
    setIsPlaying(true)
  }, [])

  const handleSeek = useCallback((time) => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((previous) => !previous)
  }, [])

  const handlePitchDecrease = useCallback(() => {
    setPitchShift((value) => Math.max(MIN_PITCH, value - 1))
  }, [])

  const handlePitchIncrease = useCallback(() => {
    setPitchShift((value) => Math.min(MAX_PITCH, value + 1))
  }, [])

  if (!currentTrack) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <Helmet>
        <title>Музыкальный плеер</title>
        <meta
          name="description"
          content="Прослушивайте гимны и треки AIK Front в интерактивном плеере."
        />
      </Helmet>
      <section className={styles.hero}>
        <h1>Музыкальный плеер AIK Front</h1>
        <p>
          Слушайте гимны клуба, подборки для тренировок и атмосферные композиции. Управляйте
          воспроизведением, переключайте треки и меняйте тональность под ваш голос.
        </p>
      </section>
      <div className={styles.layout}>
        <TrackList tracks={tracks} activeTrackId={currentTrack.id} onSelect={handleSelectTrack} />
        <div className={styles.playerColumn}>
          <section
            className={`${playerStyles.section} ${styles.currentTrack}`}
            aria-labelledby="player-current-heading"
          >
            <header>
              <h2 id="player-current-heading">Сейчас играет</h2>
            </header>
            <div className={styles.currentTrack}>
              <img
                src={currentTrack.coverUrl}
                alt={`Обложка трека ${currentTrack.title}`}
                className={playerStyles.cover}
              />
              <div className={playerStyles.trackInfo}>
                <h3 className={playerStyles.trackTitle}>{currentTrack.title}</h3>
                <p className={playerStyles.trackArtist}>{currentTrack.artist}</p>
              </div>
              <PlayerControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={currentTrack.duration}
                pitchShift={pitchShift}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onPrev={handlePrev}
                onNext={handleNext}
                onPitchDecrease={handlePitchDecrease}
                onPitchIncrease={handlePitchIncrease}
              />
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                preload="metadata"
                aria-hidden="true"
              />
            </div>
          </section>
          <LyricsPanel lines={currentTrack.lyrics} />
        </div>
      </div>
    </div>
  )
}

export default PlayerPage
