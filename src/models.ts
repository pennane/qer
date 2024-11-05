import 'express-session'

declare module 'express-session' {
  interface SessionData {
    accessToken?: string
    refreshToken?: string
    expiresIn?: string
    displayName?: string
    userId?: string
  }
}

export type SpotifyTrack = {
  album: {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
    release_date: string
    artists: { name: string; id: string }[]
  }
  id: string
  name: string
  artists: { name: string; id: string }[]
  duration_ms: number
  popularity: number
  preview_url: string | null
  uri: string
}

export type CurrentTrack = {
  id: string
  uri: string
  name: string
  artist: string
  durationMs: number
  progressMs: number
  isPlaying: boolean
}

export type Track = {
  spotifyId: string
  uri: string
  duration_ms: number
  name: string
  artists: { name: string; id: string }[]
}

export type GlobalUser = {
  id: string
  displayName: string
  accessToken: string
}

export type User = Omit<
  GlobalUser,
  'displayName' | 'accessToken' | 'refreshToken'
> & {
  queue: Track[]
  accumulatedPlaytime: number
}

export type Queue = {
  userId: string
  users: NonEmptyList<User>
}

export type UserWithTracks = Omit<User, 'queue'> & {
  queue: NonEmptyList<Track>
}

export type RequestedTrack = Track & { userId: string }

export type NonEmptyList<T> = [T, ...T[]]
