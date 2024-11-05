import { Router } from 'express'
import { fetchTracks } from '../spotify'
import { createQueue, setUserQueue, getQueue, buildTrackQueue } from '../queue'

export const queueRouter = Router()

queueRouter.post('/create', (req, res) => {
  if (!req.session.userId || !req.session.accessToken) {
    res.status(400).json({ error: 'Log in required' })
    return
  }

  try {
    const queue = createQueue(req.session.userId)
    res.status(201).json(queue)
    return
  } catch (error) {
    console.error('Error creating queue:', error)
    res.status(500).json({ error: 'Failed to create queue' })
    return
  }
})

queueRouter.post('/:id/set-user-queue', async (req, res) => {
  if (!req.session.userId || !req.session.accessToken) {
    res.status(400).json({ error: 'Log in required' })
    return
  }

  const { accessToken, userId } = req.session
  const { id: queueId } = req.params
  const { trackIds } = req.body

  if (!Array.isArray(trackIds) || trackIds.some((t) => typeof t !== 'string')) {
    res.status(400).json({ error: 'Invalid track IDs format' })
    return
  }

  try {
    const tracks = await fetchTracks(trackIds, accessToken)
    const updatedQueue = setUserQueue(
      queueId,
      userId,
      tracks.map((t) => ({
        duration_ms: t.duration_ms,
        spotifyId: t.id,
        uri: t.uri,
        artists: t.artists,
        name: t.name
      }))
    )

    const setTracks = updatedQueue.users.find((u) => u.id === userId)?.queue
    if (!setTracks) {
      res.status(404).json({ error: 'User queue not found' })
      return
    }

    res.status(200).json(setTracks)
    return
  } catch (error) {
    console.error('Error setting user queue:', error)
    res.status(500).json({ error: 'Failed to set user queue' })
    return
  }
})

queueRouter.get('/:id', (req, res) => {
  const { id: queueId } = req.params
  const queue = getQueue(queueId)

  if (!queue) {
    res.status(404).json({ error: 'Queue not found' })
    return
  }

  const trackQueue = buildTrackQueue(queue.users)
  res.status(200).json(trackQueue)
})

export default queueRouter
