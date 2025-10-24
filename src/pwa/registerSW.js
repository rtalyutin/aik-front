import { registerSW } from 'virtual:pwa-register'
import { logger } from '../utils/logger.js'

export const initPwa = () => {
  if (!('serviceWorker' in navigator)) {
    return undefined
  }

  return registerSW({
    immediate: true,
    onRegistered: () => logger.info('Service worker зарегистрирован'),
    onRegisterError: (error) => logger.error('Ошибка регистрации service worker', error),
  })
}
