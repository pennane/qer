import { buildTrackQueue, popFirstUserTrack } from './queue'
import { fetchCurrentTrack, playTrack } from './spotify'
import { getQueue, getUser, queueStore } from './stores'

const INTERVAL_DURATION = 10000
const QUEUE_NEXT_TRESHOLD = 10000
const SKIP_TO_NEXT_MS = 700

const intervalStore = new Map<string, NodeJS.Timeout>()
const timeoutStore = new Map<string, NodeJS.Timeout>()

function createProcess(id: string) {
	console.log(`(${id}) Starting process`)
	const interval = setInterval(async () => {
		try {
			if (timeoutStore.has(id)) return

			const queue = getQueue(id)
			const user = getUser(id)
			if (!queue || !user) {
				console.log(`(${id}) No queue or user found`)
				return
			}

			const trackQueue = buildTrackQueue(queue.users)
			if (!trackQueue.length) {
				console.log(`(${id}) Track queue is empty. Cleaning up process`)
				cleanUpProcess(id)
				return
			}

			const nextTrack = trackQueue[0]!

			const currentTrack = await fetchCurrentTrack(user.accessToken)
			if (!currentTrack) {
				console.log(
					`(${id}) Failed to fetch current track (requested by ${nextTrack.userDisplayName})`,
				)
				return
			}
			if (!currentTrack.isPlaying) {
				console.log(`(${id}) Nothing playing currently`)
				return
			}

			const timeToNext = Math.max(
				currentTrack.durationMs -
					currentTrack.progressMs -
					SKIP_TO_NEXT_MS,
				0,
			)

			if (timeToNext > QUEUE_NEXT_TRESHOLD) {
				console.log(
					`(${id}) Time to next track (${nextTrack.name}): ${timeToNext} ms (requested by ${nextTrack.userDisplayName})`,
				)
				return
			}

			console.log(
				`(${id}) Scheduling next track (${nextTrack.name}) in ${timeToNext} ms (requested by ${nextTrack.userDisplayName})`,
			)
			const timeout = setTimeout(async () => {
				try {
					popFirstUserTrack(queue.userId, nextTrack.userId)
					await playTrack(user.accessToken, nextTrack.uri)
					console.log(
						`(${id}) Playing next track (${nextTrack.name}) (requested by ${nextTrack.userDisplayName})`,
					)
				} catch (error) {
					console.error(
						`(${id}) Error playing track (${nextTrack.name}):`,
						error,
					)
				} finally {
					timeoutStore.delete(id)
				}
			}, timeToNext)

			timeoutStore.set(id, timeout)
		} catch (error) {
			console.error(`(${id}) Error processing playback:`, error)
		}
	}, INTERVAL_DURATION)

	intervalStore.set(id, interval)
}

function cleanUpProcess(id: string) {
	clearInterval(intervalStore.get(id))
	clearTimeout(timeoutStore.get(id))
	intervalStore.delete(id)
	timeoutStore.delete(id)
	console.log(`(${id}) Cleaned up process`)
}

let started = false

export function startPlaybackHandling() {
	if (started) return
	started = true

	setInterval(() => {
		queueStore.values().forEach((queue) => {
			const trackQueue = buildTrackQueue(queue.users)
			const interval = intervalStore.get(queue.userId)

			if (!trackQueue.length) {
				cleanUpProcess(queue.userId)
				return
			}

			if (!interval) {
				createProcess(queue.userId)
			}
		})

		intervalStore.keys().forEach((key) => {
			if (!queueStore.has(key)) {
				cleanUpProcess(key)
			}
		})
	}, INTERVAL_DURATION)
}