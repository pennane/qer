import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { isNotEmpty } from '../lib/fp'
import {
	Track,
	NonEmptyList,
	QueueUser,
	RequestedTrack,
	UserWithTracks,
	Queue,
} from '../models'

export const queueStore = new Map<string, Queue>()

function hasTracksInQueue(x: QueueUser): x is UserWithTracks {
	return isNotEmpty(x.queue)
}

function nextUser(
	users: NonEmptyList<UserWithTracks>,
): [UserWithTracks, UserWithTracks[]] {
	const [next, ...rest] = users.toSorted((a, b) => {
		const timeDelta = a.accumulatedPlaytime - b.accumulatedPlaytime
		if (timeDelta !== 0) return timeDelta
		return a.joined - b.joined
	})
	return [next!, rest]
}

function nextTrack(
	users: NonEmptyList<UserWithTracks>,
): [RequestedTrack, users: UserWithTracks[]] {
	const [user, rest] = nextUser(users)

	const [track, ...restTracks] = user.queue
	const requestedTrack = {
		...track,
		userId: user.id,
	}

	if (!isNotEmpty(restTracks)) {
		return [requestedTrack, rest]
	}

	return [
		requestedTrack,
		rest.concat({
			...user,
			queue: restTracks,
			accumulatedPlaytime: user.accumulatedPlaytime + track.duration_ms,
		}),
	]
}

export function buildTrackQueue(users: QueueUser[]): RequestedTrack[] {
	const usersWithTracks = users.filter(hasTracksInQueue)

	if (!isNotEmpty(usersWithTracks)) return []

	const queue: RequestedTrack[] = []
	let us: NonEmptyList<UserWithTracks> = usersWithTracks

	for (;;) {
		const [next, usersWithMoreTracks] = nextTrack(us)
		queue.push(next)
		if (!isNotEmpty(usersWithMoreTracks)) {
			break
		}
		us = usersWithMoreTracks
	}

	return queue
}

export function addUserToQueue(queueUserId: string, userId: string) {
	const queue = queueStore.get(queueUserId)
	if (!queue) throw new Error('no queue')
	if (queue.users.some((user) => user.id === userId))
		throw new Error('Already in said queue')
	queue.users = queue.users.concat({
		id: userId,
		accumulatedPlaytime: 0,
		queue: [],
		joined: Date.now(),
	}) as NonEmptyList<QueueUser>
	return queue
}

export function setUserQueue(
	queueUserId: string,
	userId: string,
	tracks: Track[],
) {
	const queue = queueStore.get(queueUserId)
	if (!queue) throw new Error('no queue')
	queue.users = queue.users.map((u) =>
		u.id === userId ? { ...u, queue: tracks } : u,
	) as NonEmptyList<QueueUser>
	return queue
}

export function popFirstUserTrack(queueId: string, userId: string): boolean {
	const queue = queueStore.get(queueId)
	if (!queue) return false

	const userIndex = queue.users.findIndex((u) => u.id === userId)
	if (userIndex === -1) return false

	queue.users[userIndex]!.queue = queue.users[userIndex]!.queue.slice(1)
	return true
}

export async function createQueue(sdk: SpotifyApi): Promise<Queue> {
	const profile = await sdk.currentUser.profile()
	const queue: Queue = queueStore.get(profile.id) || {
		userId: profile.id,
		users: [
			{
				id: profile.id,
				accumulatedPlaytime: 0,
				queue: [],
				joined: Date.now(),
			},
		],
	}
	queueStore.set(profile.id, queue)
	return queue
}
