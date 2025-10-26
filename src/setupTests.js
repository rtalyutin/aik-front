import '@testing-library/jest-dom'

if (typeof window !== 'undefined') {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback) => setTimeout(callback, 16)
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (handle) => clearTimeout(handle)
  }
}
