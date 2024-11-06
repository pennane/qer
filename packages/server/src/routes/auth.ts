import { Router } from 'express'
import { getSpotify } from '../qer/spotify'

export const authRouter = Router()

authRouter.post('/accept', async (req, res) => {
	const { api } = await getSpotify(req, res)
	if (!api) {
		res.status(400).json({ error: 'bruh' })
		return
	}
	res.send(200)
})

authRouter.post('/me', async (req, res) => {
	const { profile } = await getSpotify(req)
	if (!profile) {
		res.status(401).json({ msg: 'moro, kirjaudu sisää' })
		return
	}

	res.json(profile)
})

export default authRouter
