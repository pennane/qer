import { buildTrackQueue, popFirstUserTrack, queueStore } from './queue'
import { apiStore } from './spotify'
import { NonEmptyList, QueueUser } from '../models'

const PROCESS_INSPECT_INTERVAL = 10000
const QUEUE_NEXT_TRESHOLD = 10000
const SKIP_TO_NEXT_MS = 1200
const TIME_TO_KEEP_INACTIVE_QUEUE = 1000 * 60 * 60

const processStore = new Map<string, NodeJS.Timeout>()
const scheduleStore = new Map<string, NodeJS.Timeout>()

function createProcess(id: string) {
	console.log(`(${id}) Starting process`)
	const interval = setInterval(async () => {
		try {
			if (scheduleStore.has(id)) return

			const queue = queueStore.get(id)
			if (!queue) {
				console.log(`(${id}) No queue found`)
				cleanUpProcess(id)
				return
			}

			const api = apiStore.get(id)

			if (!api) {
				console.log(`(${id}) Failed to get sdk`)
				cleanUpProcess(id)
				return
			}

			const queueTracks = buildTrackQueue(queue)

			if (!queueTracks.length) {
				console.log(`(${id}) Track queue is empty. Cleaning up process`)
				cleanUpProcess(id)
				return
			}

			const nextTrack = queueTracks[0]!

			const currentTrack = await api.player.getCurrentlyPlayingTrack()

			if (!currentTrack) {
				popFirstUserTrack(queue.userId, nextTrack.userId)
				console.log(
					`(${id}) Failed to fetch current track (requested by ${nextTrack.userId})`,
				)
				return
			}
			if (!currentTrack.is_playing) {
				console.log(`(${id}) Nothing playing currently`)
				return
			}

			const timeToNext = Math.max(
				currentTrack.item.duration_ms -
					currentTrack.progress_ms -
					SKIP_TO_NEXT_MS,
				0,
			)

			if (timeToNext > QUEUE_NEXT_TRESHOLD) {
				console.log(
					`(${id}) Time to next track (${nextTrack.name}): ${timeToNext} ms (requested by ${nextTrack.userId})`,
				)
				return
			}

			console.log(
				`(${id}) Scheduling next track (${nextTrack.name}) in ${timeToNext} ms (requested by ${nextTrack.userId})`,
			)
			const timeout = setTimeout(async () => {
				try {
					popFirstUserTrack(queue.userId, nextTrack.userId)
					await api.player.startResumePlayback(
						undefined as unknown as string,
						undefined,
						[nextTrack.uri],
					)
					console.log(
						`(${id}) Playing next track (${nextTrack.name}) (requested by ${nextTrack.userId})`,
					)
				} catch (error) {
					console.error(
						`(${id}) Error playing track (${nextTrack.name}):`,
						error,
					)
				} finally {
					scheduleStore.delete(id)
				}
			}, timeToNext)

			scheduleStore.set(id, timeout)
		} catch (error) {
			console.error(`(${id}) Error processing playback:`, error)
		}
	}, PROCESS_INSPECT_INTERVAL)

	processStore.set(id, interval)
}

export function cleanUpProcess(id: string) {
	const queue = queueStore.get(id)
	if (queue) {
		queue.users = queue.users.map((user) => ({
			...user,
			accumulatedPlaytime: 0,
		})) as NonEmptyList<QueueUser>
	}
	apiStore.delete(id)
	clearInterval(processStore.get(id))
	clearTimeout(scheduleStore.get(id))
	processStore.delete(id)
	scheduleStore.delete(id)
	console.log(`(${id}) Cleaned up process`)
}

let started = false

export function startPlaybackHandling() {
	if (started) return
	started = true

	setInterval(() => {
		const now = Date.now()
		queueStore.values().forEach((queue) => {
			const queueTracks = buildTrackQueue(queue)
			const interval = processStore.get(queue.userId)

			if (!queueTracks.length) {
				cleanUpProcess(queue.userId)
				return
			}

			if (now - queue.updatedAt > TIME_TO_KEEP_INACTIVE_QUEUE) {
				cleanUpProcess(queue.userId)
				return
			}

			if (!interval) {
				createProcess(queue.userId)
			}
		})

		processStore.keys().forEach((key) => {
			if (!queueStore.has(key)) {
				cleanUpProcess(key)
			}
		})
	}, PROCESS_INSPECT_INTERVAL)
}
