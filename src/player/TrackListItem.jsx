import PropTypes from 'prop-types'
import styles from './player.module.css'

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const TrackListItem = ({ id, track, isActive, onSelect }) => {
  return (
    <button
      type="button"
      id={id}
      className={`${styles.itemButton} ${isActive ? styles.itemActive : ''}`}
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
    >
      <div className={styles.itemContent}>
        <p className={styles.itemTitle}>{track.title}</p>
        <p className={styles.itemSubtitle}>{track.artist}</p>
      </div>
      <span className={styles.itemMeta}>{formatDuration(track.duration)}</span>
    </button>
  )
}

TrackListItem.propTypes = {
  id: PropTypes.string.isRequired,
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default TrackListItem
