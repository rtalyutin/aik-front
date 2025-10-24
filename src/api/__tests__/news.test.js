import { jest } from '@jest/globals'
import { ApiError } from '../httpClient.js'
import { fetchNews, newsSchemas } from '../news.js'

const mockClient = { get: jest.fn() }

global.__APP_ENV__ = {
  ...(global.__APP_ENV__ || {}),
  VITE_API_BASE_URL: 'https://api.aik-front.test',
}

describe('news API helpers', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('валидирует и возвращает новости при корректном ответе', async () => {
    const payload = {
      items: [
        {
          id: '1',
          title: 'Test',
          summary: 'Summary',
          publishedAt: '2025-01-01T00:00:00.000Z',
          link: 'https://example.com/news',
        },
      ],
    }
    mockClient.get.mockResolvedValueOnce(payload)

    const result = await fetchNews({ client: mockClient })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ id: '1', title: 'Test' })
  })

  it('бросает ApiError при невалидном ответе', async () => {
    mockClient.get.mockResolvedValueOnce({ invalid: true })

    await expect(fetchNews({ client: mockClient })).rejects.toBeInstanceOf(ApiError)
  })

  it('схема отклоняет новости без обязательных полей', () => {
    const invalid = [{ id: '1', title: 'No summary' }]
    const result = newsSchemas.response.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
