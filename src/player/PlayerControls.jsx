import PropTypes from 'prop-types'
import styles from './player.module.css'

const formatTime = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0
  const minutes = Math.floor(safeSeconds / 60)
  const remainder = Math.floor(safeSeconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

const PlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  pitchShift,
  onPlayPause,
  onSeek,
  onPrev,
  onNext,
  onPitchDecrease,
  onPitchIncrease,
}) => {
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const sliderValue = Math.min(currentTime, safeDuration)

  return (
    <div className={styles.controls}>
      <div className={styles.primaryControls}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Предыдущий трек"
          onClick={onPrev}
        >
          ◀
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.playButton}`}
          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          onClick={onPlayPause}
        >
          {isPlaying ? 'II' : '▶'}
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Следующий трек"
          onClick={onNext}
        >
          ▶
        </button>
      </div>
      <div>
        <label className="visually-hidden" htmlFor="player-seek">
          Перемотка по времени
        </label>
        <input
          id="player-seek"
          type="range"
          min="0"
          max={safeDuration || 1}
          step="1"
          value={sliderValue}
          onChange={(event) => onSeek(Number(event.target.value))}
          className={styles.seekBar}
          aria-valuenow={Math.floor(sliderValue)}
          aria-valuemin={0}
          aria-valuemax={Math.floor(safeDuration)}
        />
        <div className={styles.timerRow} aria-live="polite">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
      </div>
      <div className={styles.pitchControls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onPitchDecrease}
          aria-label="Понизить тональность"
        >
          -
        </button>
        <span className={styles.pitchBadge}>
          {pitchShift >= 0 ? `+${pitchShift}` : pitchShift} полутон
        </span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onPitchIncrease}
          aria-label="Повысить тональность"
        >
          +
        </button>
      </div>
    </div>
  )
}

PlayerControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  pitchShift: PropTypes.number.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  onSeek: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPitchDecrease: PropTypes.func.isRequired,
  onPitchIncrease: PropTypes.func.isRequired,
}

export default PlayerControls
