import { fetchNews, NEWS_QUERY_KEY } from '../api/news.js'
import fallback from '../news/config.json'
import { useApiResource } from './useApiResource.js'

export const useNews = (options) =>
  useApiResource(NEWS_QUERY_KEY, fetchNews, {
    fallbackData: () => fallback.items,
    ...options,
  })
