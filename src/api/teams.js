import { z } from 'zod'
import { ApiError, httpClient } from './httpClient.js'

const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  coach: z.string(),
  arena: z.string(),
  founded: z.number().int().min(1800).max(new Date().getFullYear()),
  conference: z.string(),
  website: z.string().url().optional(),
})

const teamsResponseSchema = z.union([z.object({ items: z.array(teamSchema) }), z.array(teamSchema)])

export const TEAMS_QUERY_KEY = ['teams']

const parseTeamsPayload = (payload) => {
  const result = teamsResponseSchema.safeParse(payload)

  if (!result.success) {
    throw new ApiError('Некорректный формат данных команд', 500, result.error.flatten())
  }

  return Array.isArray(result.data) ? result.data : result.data.items
}

export const fetchTeams = async ({ client = httpClient } = {}) => {
  const payload = await client.get('/teams')
  return parseTeamsPayload(payload)
}

export const teamSchemas = {
  item: teamSchema,
  response: teamsResponseSchema,
}
