import { SpotifyTrack, GlobalUser, Queue } from './models'

const trackStore = new Map<string, SpotifyTrack>()
const userStore = new Map<string, GlobalUser>()
export const queueStore = new Map<string, Queue>()

export const getTrack = (trackId: string): SpotifyTrack | null => {
	return trackStore.get(trackId) ?? null
}

export function addUser(user: GlobalUser): void {
	userStore.set(user.id, user)
}

export function getUser(userId: string): GlobalUser | null {
	return userStore.get(userId) ?? null
}

export const addTrack = (track: SpotifyTrack): void => {
	trackStore.set(track.id, track)
}

export const deleteQueue = (userId: string): boolean => {
	return queueStore.delete(userId)
}

export const createQueue = (userId: string): Queue | null => {
	const user = getUser(userId)
	if (!user) return null

	const queue: Queue = queueStore.get(userId) || {
		userId,
		users: [
			{ ...user, accumulatedPlaytime: 0, queue: [], joined: Date.now() },
		],
	}
	queueStore.set(userId, queue)
	return queue
}

export const getQueue = (userId: string): Queue | null => {
	return queueStore.get(userId) ?? null
}
