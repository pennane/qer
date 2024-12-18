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
		if (!a.queue.length) return 1
		if (!b.queue.length) return -1
		return a.queue[0]!.added - b.queue[0]!.added
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

export function buildTrackQueue(queue: Pick<Queue, 'users'>): RequestedTrack[] {
	const usersWithTracks = queue.users.filter(hasTracksInQueue)

	if (!isNotEmpty(usersWithTracks)) return []

	const tracks: RequestedTrack[] = []
	let us: NonEmptyList<UserWithTracks> = usersWithTracks

	for (;;) {
		const [next, usersWithMoreTracks] = nextTrack(us)
		tracks.push(next)
		if (!isNotEmpty(usersWithMoreTracks)) {
			break
		}
		us = usersWithMoreTracks
	}

	return tracks
}

export function setUserQueue(
	queueUserId: string,
	userId: string,
	tracks: Track[],
) {
	const queue = queueStore.get(queueUserId)
	if (!queue) throw new Error('no queue')

	const userIndex = queue.users.findIndex((u) => u.id === userId)

	if (userIndex === -1) {
		queue.users = queue.users.concat({
			id: userId,
			accumulatedPlaytime: 0,
			queue: tracks,
		}) as NonEmptyList<QueueUser>
	} else {
		queue.users[userIndex]!.queue = tracks
	}

	queue.updatedAt = Date.now()

	return queue
}

export function popFirstUserTrack(
	queueId: string,
	userId: string,
	skiptimeaddition?: boolean,
) {
	const queue = queueStore.get(queueId)
	if (!queue) return false

	const userIndex = queue.users.findIndex((u) => u.id === userId)
	if (userIndex === -1) return false
	const targetUser = queue.users[userIndex]!
	const toPop = targetUser.queue[0]
	if (!toPop) return false

	targetUser.queue = queue.users[userIndex]!.queue.slice(1)
	if (!skiptimeaddition) {
		targetUser.accumulatedPlaytime += toPop.duration_ms
	}
	queue.updatedAt = Date.now()
	return true
}

export async function createQueue(sdk: SpotifyApi): Promise<Queue> {
	const profile = await sdk.currentUser.profile()
	const queue: Queue = queueStore.get(profile.id) || {
		userId: profile.id,
		updatedAt: Date.now(),
		users: [
			{
				id: profile.id,
				accumulatedPlaytime: 0,
				queue: [],
			},
		],
	}
	queueStore.set(profile.id, queue)
	return queue
}
