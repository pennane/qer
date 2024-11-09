import express from 'express'
import session from 'express-session'
import cors from 'cors'

import cookieParser from 'cookie-parser'
import { startPlaybackHandling } from './qer/playbackHandler'
import { authRouter } from './routes/auth'
import queueRouter from './routes/queue'
import config from './lib/config'

const app = express()

const corsOptions = {
	origin: config.CORS_CLIENT_URL,
	credentials: true,
	optionsSuccessStatus: 204,
}

app.use(
	session({
		secret: config.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
	}),
)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/queue', queueRouter)

app.get('/', (req, res) => {
	res.json({ msg: 'moro' })
})

app.listen(config.PORT, () => console.info('Server running on port 3000'))

startPlaybackHandling()
