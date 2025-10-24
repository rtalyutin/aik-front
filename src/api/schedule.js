import { z } from 'zod'
import { ApiError, httpClient } from './httpClient.js'

const scheduleItemSchema = z.object({
  id: z.string(),
  opponent: z.string(),
  date: z.string().datetime({ message: 'Некорректная дата матча' }),
  location: z.string(),
  competition: z.string().optional(),
  broadcast: z.string().url().optional(),
})

const scheduleResponseSchema = z.union([
  z.object({ items: z.array(scheduleItemSchema) }),
  z.array(scheduleItemSchema),
])

export const SCHEDULE_QUERY_KEY = ['schedule']

const parseSchedulePayload = (payload) => {
  const result = scheduleResponseSchema.safeParse(payload)

  if (!result.success) {
    throw new ApiError('Некорректный формат расписания', 500, result.error.flatten())
  }

  return Array.isArray(result.data) ? result.data : result.data.items
}

export const fetchSchedule = async ({ client = httpClient } = {}) => {
  const payload = await client.get('/schedule')
  return parseSchedulePayload(payload)
}

export const scheduleSchemas = {
  item: scheduleItemSchema,
  response: scheduleResponseSchema,
}
