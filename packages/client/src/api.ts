import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { Queue } from './models'

export const fetchQueue = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/${id}`
  )
  if (!response.ok) throw new Error('failed to fetch queue')
  return response.json() as Promise<Queue>
}

export const fetchDeleteQueue = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/delete`,
    { method: 'POST', credentials: 'include' }
  )
  if (!response.ok) throw new Error('failed to delete own queue')
  return response.json() as Promise<{ deleted: boolean }>
}

export const fetchCreateQueue = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/create`,
    { method: 'POST', credentials: 'include' }
  )
  if (!response.ok) throw new Error('failed to create queue')
  return response.json() as Promise<Queue>
}

export const fetchSetTracks = async ({
  queueId,
  ids
}: {
  queueId: string
  ids: string[]
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/${queueId}/set-user-queue`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ trackIds: ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  if (!response.ok) throw new Error('failed to set queue tracks')
  return response.json() as Promise<Queue>
}

export const fetchProfile = async (api: SpotifyApi) => {
  return api.currentUser.profile()
}
