import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { Queue } from './models'

export async function fetchQueue(id: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/${id}`
  )
  if (!response.ok) throw new Error('failed to fetch queue')
  return response.json() as Promise<Queue>
}

export async function fetchDeleteQueue() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/delete`,
    { method: 'POST', credentials: 'include' }
  )
  if (!response.ok) throw new Error('failed to delete own queue')
  return response.json() as Promise<{ deleted: boolean }>
}

export async function fetchCreateQueue() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/create`,
    { method: 'POST', credentials: 'include' }
  )
  if (!response.ok) throw new Error('failed to create queue')
  return response.json() as Promise<Queue>
}

export async function fetchSetTracks({
  queueId,
  ids
}: {
  queueId: string
  ids: string[]
}) {
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

export async function fetchProfile(api: SpotifyApi) {
  return api.currentUser.profile()
}
