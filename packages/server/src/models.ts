import 'express-session'

declare module 'express-session' {
	interface SessionData {
		token?: string
		displayName?: string
		userId?: string
	}
}

export type Track = {
	spotifyId: string
	uri: string
	duration_ms: number
	name: string
	artists: { name: string; id: string }[]
	added: number
}

export type QueueUser = {
	id: string
	queue: Track[]
	accumulatedPlaytime: number
}

export type Queue = {
	userId: string
	updatedAt: number
	users: NonEmptyList<QueueUser>
}

export type UserWithTracks = Omit<QueueUser, 'queue'> & {
	queue: NonEmptyList<Track>
}

export type RequestedTrack = Track & { userId: string }

export type NonEmptyList<T> = [T, ...T[]]
