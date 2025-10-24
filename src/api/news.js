import { z } from 'zod'
import { ApiError, httpClient } from './httpClient.js'

const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  publishedAt: z.string().datetime({ message: 'Некорректная дата публикации' }),
  link: z.string().url(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
})

const newsResponseSchema = z.union([
  z.object({ items: z.array(newsItemSchema) }),
  z.array(newsItemSchema),
])

export const NEWS_QUERY_KEY = ['news']

const parseNewsPayload = (payload) => {
  const result = newsResponseSchema.safeParse(payload)

  if (!result.success) {
    throw new ApiError('Некорректный формат данных новостей', 500, result.error.flatten())
  }

  return Array.isArray(result.data) ? result.data : result.data.items
}

export const fetchNews = async ({ client = httpClient } = {}) => {
  const payload = await client.get('/news')
  return parseNewsPayload(payload)
}

export const newsSchemas = {
  item: newsItemSchema,
  response: newsResponseSchema,
}
