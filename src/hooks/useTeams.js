import { fetchTeams, TEAMS_QUERY_KEY } from '../api/teams.js'
import fallback from '../teams/config.json'
import { useApiResource } from './useApiResource.js'

export const useTeams = (options) =>
  useApiResource(TEAMS_QUERY_KEY, fetchTeams, {
    fallbackData: () => fallback.items,
    ...options,
  })
