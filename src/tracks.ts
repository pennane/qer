import { SpotifyTrack, Track } from './models'

const trackStore = new Map<string, SpotifyTrack>()

export const getTrack = (trackId: string): SpotifyTrack | null => {
  return trackStore.get(trackId) || null
}

export const addTrack = (track: SpotifyTrack) => {
  trackStore.set(track.id, track)
}
