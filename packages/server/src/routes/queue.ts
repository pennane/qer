import { Router } from 'express'
import {
	setUserQueue,
	buildTrackQueue,
	createQueue,
	queueStore,
} from '../qer/queue'
import { getSpotify } from '../qer/spotify'
import { cleanUpProcess } from '../qer/playbackHandler'

export const queueRouter = Router()

queueRouter.post('/create', async (req, res) => {
	const { api, profile } = await getSpotify(req)
	if (!api || !profile) {
		res.status(401).json({ msg: 'moro, kirjaudu sisää' })
		return
	}

	try {
		const queue = await createQueue(api)
		const trackQueue = buildTrackQueue(queue.users)
		res.status(200).json({ userId: profile.id, tracks: trackQueue })
		return
	} catch (error) {
		console.error('Error creating queue:', error)
		res.status(500).json({ error: 'Failed to create queue' })
		return
	}
})

queueRouter.post('/delete', async (req, res) => {
	const { api, profile } = await getSpotify(req)
	if (!api || !profile) {
		res.status(401).json({ msg: 'moro, kirjaudu sisää' })
		return
	}
	const deleted = queueStore.delete(profile.id)
	cleanUpProcess(profile.id)
	res.json({ deleted })
})

queueRouter.post('/:id/set-user-queue', async (req, res) => {
	const { api, profile } = await getSpotify(req)
	if (!api || !profile) {
		res.status(401).json({ msg: 'moro, kirjaudu sisää' })
		return
	}

	const { id: queueId } = req.params
	const { trackIds } = req.body

	if (
		!Array.isArray(trackIds) ||
		trackIds.some((t) => typeof t !== 'string')
	) {
		res.status(400).json({ error: 'Invalid track IDs format' })
		return
	}

	try {
		const userId = profile.id
		const tracks = trackIds.length ? await api.tracks.get(trackIds) : []
		const now = Date.now()
		const updatedQueue = setUserQueue(
			queueId,
			userId,
			tracks.map((t) => ({
				duration_ms: t.duration_ms,
				spotifyId: t.id,
				uri: t.uri,
				artists: t.artists,
				name: t.name,
				added: now,
			})),
		)
		const queueTracks = buildTrackQueue(updatedQueue.users)

		res.status(200).json({ userId, tracks: queueTracks })
		return
	} catch (error) {
		console.error('Error setting user queue:', error)
		res.status(500).json({ error: 'Failed to set user queue' })
		return
	}
})

queueRouter.get('/:id', (req, res) => {
	const { id: queueId } = req.params
	const queue = queueStore.get(queueId)

	if (!queue) {
		res.status(404).json({ error: 'Queue not found' })
		return
	}

	const trackQueue = buildTrackQueue(queue.users)
	res.status(200).json({ userId: queueId, tracks: trackQueue })
})

export default queueRouter
