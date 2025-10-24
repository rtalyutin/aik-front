import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { logger } from '../utils/logger.js'

const defaultOptions = {
  staleTime: 60_000,
  retry: 2,
}

export const useApiResource = (queryKey, fetcher, { fallbackData, select, ...overrides } = {}) => {
  const query = useQuery({
    queryKey,
    queryFn: fetcher,
    ...defaultOptions,
    ...overrides,
    throwOnError: false,
    onError: (error) => {
      logger.error('Ошибка запроса', error)
      overrides.onError?.(error)
    },
  })

  const value = useMemo(() => {
    if (query.data) {
      return { data: select ? select(query.data) : query.data, isFallback: false }
    }

    if (query.error && fallbackData) {
      const data = typeof fallbackData === 'function' ? fallbackData() : fallbackData
      return { data, isFallback: true }
    }

    return { data: undefined, isFallback: false }
  }, [query.data, query.error, fallbackData, select])

  return {
    ...query,
    data: value.data,
    isFallback: value.isFallback,
  }
}
