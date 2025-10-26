import { useEffect, useMemo, useRef, useState } from 'react'
import { getActiveLine, getActiveWord } from '../utils/lyrics.js'

export default function LyricsView({ track, playerState, player }) {
  const [lyricsData, setLyricsData] = useState({ tracks: [] })
  const [error, setError] = useState(null)
  const scrollerRef = useRef(null)
  const activeLineRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const loadLyrics = async () => {
      try {
        const response = await fetch('/data/lyrics.json')
        if (!response.ok) {
          throw new Error('Не удалось загрузить текст')
        }

        const payload = await response.json()
        if (!cancelled) {
          setLyricsData(payload)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err)
        }
      }
    }

    loadLyrics()
    return () => {
      cancelled = true
    }
  }, [])

  const lines = useMemo(() => {
    const entry = lyricsData.tracks.find((item) => item.id === track?.id)
    return entry?.lines ?? []
  }, [lyricsData, track])

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  }, [track?.id])

  useEffect(() => {
    if (playerState.playing) {
      player.play()
    }
  }, [player, playerState.playing])

  const activeLine = useMemo(
    () => getActiveLine(lines, playerState.currentMs),
    [lines, playerState.currentMs],
  )
  const activeWord = useMemo(
    () => getActiveWord(activeLine.line, playerState.currentMs),
    [activeLine.line, playerState.currentMs],
  )

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeLine.index, track?.id])

  useEffect(() => {
    const handleArrows = (event) => {
      if (!scrollerRef.current) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        scrollerRef.current.scrollBy({ top: 80, behavior: 'smooth' })
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        scrollerRef.current.scrollBy({ top: -80, behavior: 'smooth' })
      }
    }

    document.addEventListener('keydown', handleArrows)
    return () => document.removeEventListener('keydown', handleArrows)
  }, [])

  if (error) {
    return (
      <div className="lyrics">
        <div className="empty-state">{error.message}</div>
      </div>
    )
  }

  if (track?.status !== 'ready') {
    return (
      <div className="lyrics">
        <div className="empty-state">Трек недоступен для караоке</div>
      </div>
    )
  }

  return (
    <div className="lyrics">
      <div
        ref={scrollerRef}
        className="lyrics__scroller"
        aria-live="polite"
        aria-label={`Текст трека ${track?.title ?? ''}`}
      >
        {lines.length === 0 ? (
          <div className="empty-state">Текст загружается...</div>
        ) : (
          lines.map((line, index) => {
            const state =
              index === activeLine.index ? 'active' : index < activeLine.index ? 'past' : 'future'

            return (
              <p
                key={`${track.id}-${index}`}
                className="lyrics__line"
                data-state={state}
                ref={index === activeLine.index ? activeLineRef : null}
              >
                {Array.isArray(line.words) && line.words.length > 0
                  ? line.words.map((word, wordIndex) => (
                      <span
                        key={`${track.id}-${index}-${wordIndex}`}
                        className="lyrics__word"
                        data-active={activeLine.index === index && activeWord.index === wordIndex}
                      >
                        {word.text}
                        {word.trailing ?? ' '}
                      </span>
                    ))
                  : line.text}
              </p>
            )
          })
        )}
      </div>
    </div>
  )
}
