import { fetchSchedule, SCHEDULE_QUERY_KEY } from '../api/schedule.js'
import fallback from '../schedule/config.json'
import { useApiResource } from './useApiResource.js'

export const useSchedule = (options) =>
  useApiResource(SCHEDULE_QUERY_KEY, fetchSchedule, {
    fallbackData: () => fallback.items,
    ...options,
  })
