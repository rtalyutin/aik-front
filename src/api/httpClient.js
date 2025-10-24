import axios from 'axios'
import { logger } from '../utils/logger.js'

// eslint-disable-next-line no-undef
const runtimeEnv = typeof __APP_ENV__ !== 'undefined' ? __APP_ENV__ : process.env

const baseURL = runtimeEnv?.VITE_API_BASE_URL

if (!baseURL) {
  logger.warn('Переменная окружения VITE_API_BASE_URL не задана. Используется относительный URL.')
}

const requestTimeout = Number.parseInt(runtimeEnv?.VITE_REQUEST_TIMEOUT || '8000', 10)

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const client = axios.create({
  baseURL: baseURL || '/',
  timeout: Number.isFinite(requestTimeout) ? requestTimeout : 8000,
  headers: {
    Accept: 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status ?? 'NETWORK_ERROR'
    const payload = error.response?.data
    const message =
      payload?.message ||
      error.message ||
      'Не удалось выполнить запрос. Попробуйте обновить страницу позже.'

    const apiError = new ApiError(message, status, payload)
    logger.error('API error', {
      message: apiError.message,
      status: apiError.status,
      details: apiError.details,
    })

    return Promise.reject(apiError)
  },
)

const unwrap = (response) => response.data

export const httpClient = {
  get: (url, config) => client.get(url, config).then(unwrap),
  post: (url, data, config) => client.post(url, data, config).then(unwrap),
  put: (url, data, config) => client.put(url, data, config).then(unwrap),
  patch: (url, data, config) => client.patch(url, data, config).then(unwrap),
  delete: (url, config) => client.delete(url, config).then(unwrap),
}

export default httpClient
