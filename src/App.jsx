import { useEffect, useMemo } from 'react'
import { useSyncExternalStore } from 'react'
import Header from './components/Header.jsx'
import TrackList from './components/TrackList.jsx'
import PlayPause from './components/PlayPause.jsx'
import LyricsView from './components/LyricsView.jsx'
import './styles/app.css'

const TRACKS = [
  { id: 'track-1', title: 'Лунная ночь', status: 'ready' },
  { id: 'track-2', title: 'Городские огни', status: 'queue' },
  { id: 'track-3', title: 'Танец ветра', status: 'ready' },
  { id: 'track-4', title: 'Зимний блюз', status: 'error' },
  { id: 'track-5', title: 'Свободный полёт', status: 'queue' },
]

function usePlayerState(player) {
  return useSyncExternalStore(player.subscribe, player.getState, player.getState)
}

export default function App({ player }) {
  const state = usePlayerState(player)
  const activeTrack = useMemo(
    () => TRACKS.find((track) => track.id === state.activeTrackId) ?? TRACKS[0],
    [state.activeTrackId],
  )
  const isPlayable = activeTrack?.status === 'ready'

  useEffect(() => {
    if (!state.activeTrackId && TRACKS.length > 0) {
      player.setTrack(TRACKS[0].id)
    }
  }, [player, state.activeTrackId])

  useEffect(() => {
    const handleSpace = (event) => {
      if (event.code === 'Space' && !event.defaultPrevented && isPlayable) {
        event.preventDefault()
        player.toggle()
      }
    }

    document.addEventListener('keydown', handleSpace)
    return () => document.removeEventListener('keydown', handleSpace)
  }, [player, isPlayable])

  useEffect(() => {
    if (!isPlayable) {
      player.pause()
    }
  }, [isPlayable, player])

  return (
    <div className="app" data-playing={state.playing}>
      <Header />
      <div className="app__body">
        <aside className="app__sidebar" aria-label="Список треков">
          <TrackList
            tracks={TRACKS}
            activeTrackId={state.activeTrackId}
            onSelect={(trackId) => player.setTrack(trackId)}
          />
        </aside>
        <section className="app__karaoke">
          <div className="app__controls">
            <PlayPause
              playing={state.playing}
              disabled={!isPlayable}
              onToggle={() => player.toggle()}
            />
          </div>
          <LyricsView track={activeTrack} playerState={state} player={player} />
        </section>
      </div>
    </div>
  )
}
