import PropTypes from 'prop-types'
import TrackListItem from './TrackListItem.jsx'
import styles from './player.module.css'

const TrackList = ({ tracks, activeTrackId, onSelect }) => {
  return (
    <section className={styles.section} aria-labelledby="player-tracklist-heading">
      <header>
        <h2 id="player-tracklist-heading">Плейлист</h2>
        <p>Выберите трек, чтобы прослушать его в плеере.</p>
      </header>
      <ul
        className={styles.list}
        role="listbox"
        aria-activedescendant={`track-${activeTrackId}`}
        tabIndex={0}
      >
        {tracks.map((track) => (
          <li key={track.id} role="presentation">
            <TrackListItem
              id={`track-${track.id}`}
              track={track}
              isActive={track.id === activeTrackId}
              onSelect={() => onSelect(track.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

TrackList.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      artist: PropTypes.string.isRequired,
      duration: PropTypes.number.isRequired,
    }),
  ).isRequired,
  activeTrackId: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default TrackList
