import { jest } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApiResource } from '../useApiResource.js'

const createTestQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { queryClient, wrapper }
}

describe('useApiResource', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('возвращает данные из fetcher без fallback', async () => {
    const data = { value: 42 }
    const fetcher = jest.fn().mockResolvedValueOnce(data)
    const { queryClient, wrapper } = createTestQueryClient()

    const { result } = renderHook(() => useApiResource(['test'], fetcher), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(data)
    expect(result.current.isFallback).toBe(false)

    queryClient.clear()
  })

  it('использует fallbackData при ошибке fetcher', async () => {
    const error = new Error('Network error')
    const fetcher = jest.fn().mockRejectedValue(error)
    const fallbackData = { value: 'fallback' }
    const { queryClient, wrapper } = createTestQueryClient()

    const { result } = renderHook(
      () =>
        useApiResource(['test-fallback'], fetcher, {
          fallbackData,
          retry: 0,
        }),
      {
        wrapper,
      },
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual(fallbackData)
    expect(result.current.isFallback).toBe(true)

    queryClient.clear()
  })
})
