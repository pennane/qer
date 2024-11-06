import express from 'express'
import session from 'express-session'
import { startPlaybackHandling } from './qer/playbackHandler'
import { fetchUserProfile } from './qer/spotify'
import { authRouter } from './routes/auth'
import queueRouter from './routes/queue'

const app = express()

app.use(express.json())
app.use(
	session({
		secret: 'blaablaaihansama',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false, maxAge: 60000 },
	}),
)

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/queue', queueRouter)

app.get('/', async (req, res) => {
	if (!req.session.accessToken) {
		res.send('moro, kirjaudu sisää')
		return
	}
	const user = await fetchUserProfile(req.session.accessToken)
	res.json(user)
})

app.listen(3000, () => console.log('Server running on port 3000'))

startPlaybackHandling()
