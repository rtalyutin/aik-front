function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function createState() {
  return {
    playing: false,
    currentMs: 0,
    activeTrackId: null,
  }
}

export function createPlayerStore(initialState = {}) {
  let state = { ...createState(), ...initialState }
  let animationFrame = null
  let startTimestamp = 0
  const listeners = new Set()
  const scheduleAnimation =
    typeof requestAnimationFrame === 'function'
      ? (callback) => requestAnimationFrame(callback)
      : (callback) => setTimeout(callback, 16)

  const cancelAnimation =
    typeof cancelAnimationFrame === 'function'
      ? (handle) => cancelAnimationFrame(handle)
      : (handle) => clearTimeout(handle)

  const notify = () => {
    listeners.forEach((listener) => listener(state))
  }

  const setState = (partial) => {
    state = { ...state, ...partial }
    notify()
  }

  const stopAnimation = () => {
    if (animationFrame !== null) {
      cancelAnimation(animationFrame)
      animationFrame = null
    }
  }

  const tick = () => {
    if (!state.playing) {
      stopAnimation()
      return
    }

    const elapsed = Math.max(0, now() - startTimestamp)
    setState({ currentMs: elapsed })
    animationFrame = scheduleAnimation(tick)
  }

  const play = () => {
    if (!state.activeTrackId || state.playing) {
      return
    }

    startTimestamp = now() - state.currentMs
    setState({ playing: true })
    stopAnimation()
    animationFrame = scheduleAnimation(tick)
  }

  const pause = () => {
    if (!state.playing) {
      return
    }

    stopAnimation()
    setState({ playing: false })
  }

  const toggle = () => {
    if (state.playing) {
      pause()
    } else {
      play()
    }
  }

  const seek = (nextPositionMs) => {
    const clamped = Math.max(0, Number(nextPositionMs) || 0)
    startTimestamp = now() - clamped
    setState({ currentMs: clamped })
  }

  const setTrack = (trackId) => {
    if (state.activeTrackId === trackId) {
      return
    }

    stopAnimation()
    startTimestamp = now()
    state = { ...state, activeTrackId: trackId, currentMs: 0, playing: false }
    notify()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      pause()
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    play,
    pause,
    toggle,
    seek,
    setTrack,
  }
}

const playerStore = createPlayerStore()

export default playerStore
