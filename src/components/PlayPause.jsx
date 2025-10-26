export default function PlayPause({ playing, onToggle, disabled = false }) {
  const handleActivate = (event) => {
    if (disabled || !onToggle) {
      return
    }

    if (event.type === 'click') {
      onToggle()
      return
    }

    if (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onToggle()
    }
  }

  return (
    <button
      type="button"
      className="playpause-button"
      aria-label={playing ? 'Пауза' : 'Играть'}
      aria-pressed={playing}
      data-pressed={playing}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleActivate}
      onKeyDown={handleActivate}
    >
      {playing ? '❚❚' : '►'}
    </button>
  )
}
