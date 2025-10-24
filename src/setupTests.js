import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'
import { BroadcastChannel } from 'worker_threads'

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}

if (!global.BroadcastChannel) {
  global.BroadcastChannel = BroadcastChannel
}

if (!global.__APP_ENV__) {
  global.__APP_ENV__ = {
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost',
    VITE_REQUEST_TIMEOUT: process.env.VITE_REQUEST_TIMEOUT || '8000',
  }
}
