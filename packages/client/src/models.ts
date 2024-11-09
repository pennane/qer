export type QueueTrack = {
  spotifyId: string
  uri: string
  duration_ms: number
  name: string
  artists: { name: string; id: string }[]
  userId: string
}

export type Queue = {
  userId: string
  tracks: QueueTrack[]
}