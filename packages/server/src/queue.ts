import { isNotEmpty } from './lib'
import {
	Track,
	NonEmptyList,
	QueueUser,
	RequestedTrack,
	UserWithTracks,
	Queue,
} from './models'
import { getUser } from './users'

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
		userDisplayName: user.displayName,
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

export const queueStore = new Map<string, Queue>()

export const popFirstUserTrack = (queueId: string, userId: string) => {
	const queue = queueStore.get(queueId)
	if (!queue) return
	queue.users = queue.users.map((u) =>
		u.id === userId ? { ...u, queue: u.queue.slice(1) } : u,
	) as NonEmptyList<QueueUser>
}

export const deleteQueue = (userId: string): boolean => {
	return queueStore.delete(userId)
}

export const createQueue = (userId: string): Queue => {
	const user = getUser(userId)!
	const queue: Queue = queueStore.get(userId) || {
		userId,
		users: [
			{ ...user, accumulatedPlaytime: 0, queue: [], joined: Date.now() },
		],
	}
	queueStore.set(user.id, queue)
	return queue
}

export const getQueue = (userId: string): Queue | null => {
	return queueStore.get(userId) || null
}

export const addUserToQueue = (queueUserId: string, userId: string) => {
	const queue = queueStore.get(queueUserId)
	const user = getUser(userId)
	if (!queue) throw new Error('no queue')
	if (!user) throw new Error('no user')
	if (queue.users.some((user) => user.id === userId))
		throw new Error('Already in said queue')
	queue.users = queue.users.concat({
		id: userId,
		displayName: user.displayName,
		accumulatedPlaytime: 0,
		queue: [],
		joined: Date.now(),
	}) as NonEmptyList<QueueUser>
	return queue
}

export const setUserQueue = (
	queueUserId: string,
	userId: string,
	tracks: Track[],
) => {
	const queue = queueStore.get(queueUserId)
	if (!queue) throw new Error('no queue')
	queue.users = queue.users.map((u) =>
		u.id === userId ? { ...u, queue: tracks } : u,
	) as NonEmptyList<QueueUser>
	return queue
}
