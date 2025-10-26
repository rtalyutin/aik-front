import { useCallback } from 'react'

const statusLabels = {
  ready: 'готов',
  queue: 'очередь',
  error: 'ошибка',
}

export default function TrackList({ tracks, activeTrackId, onSelect }) {
  const handleSelect = useCallback(
    (trackId) => {
      if (typeof onSelect === 'function') {
        onSelect(trackId)
      }
    },
    [onSelect],
  )

  return (
    <div className="tracklist">
      <table className="track-table">
        <thead>
          <tr>
            <th scope="col">№</th>
            <th scope="col">Трек</th>
            <th scope="col">Статус</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr
              key={track.id}
              tabIndex={0}
              role="button"
              aria-pressed={activeTrackId === track.id}
              data-active={activeTrackId === track.id}
              onClick={() => handleSelect(track.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSelect(track.id)
                }
              }}
            >
              <td>{String(index + 1).padStart(2, '0')}</td>
              <td>{track.title}</td>
              <td>
                <span className="status-chip" data-status={track.status}>
                  {statusLabels[track.status] ?? track.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="tracklist__fab" aria-label="Добавить трек">
        +
      </button>
    </div>
  )
}
