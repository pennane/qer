import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import {
  fetchUserProfile,
  createAuthURL,
  fetchToken,
  refreshAccessToken
} from '../spotify'

export const authRouter = Router()

authRouter.get('/login', (req, res) => {
  const state = randomUUID()
  res.redirect(createAuthURL(state))
})

authRouter.get('/callback', async (req, res) => {
  const code = req.query.code as string | null
  if (!code) {
    res.status(400).json({ error: 'Authorization code is missing' })
    return
  }

  try {
    const tokenData = await fetchToken(code)
    if (
      !tokenData?.access_token ||
      !tokenData?.refresh_token ||
      !tokenData?.expires_in
    ) {
      res.status(400).json({ error: 'Invalid response from Spotify' })
      return
    }

    req.session.accessToken = tokenData.access_token
    req.session.refreshToken = tokenData.refresh_token
    req.session.expiresIn = tokenData.expires_in

    const userProfile = await fetchUserProfile(tokenData.access_token)
    req.session.displayName = userProfile.display_name
    req.session.userId = userProfile.id

    res.status(200).redirect('/')
    return
  } catch (error) {
    console.error('Error during authentication:', error)
    res.status(500).json({ error: 'Failed to authenticate with Spotify' })
    return
  }
})

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.session
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is missing' })
    return
  }

  try {
    const json = await refreshAccessToken(refreshToken)
    if (!json?.access_token) {
      res.status(400).json({ error: 'Failed to refresh access token' })
      return
    }

    req.session.accessToken = json.access_token
    req.session.expiresIn = json.expires_in

    res.status(200).send('Access token refreshed')
    return
  } catch (error) {
    console.error('Error refreshing access token:', error)
    res.status(500).json({ error: 'Failed to refresh access token' })
    return
  }
})

authRouter.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err)
      res.status(500).json({ error: 'Failed to log out' })
      return
    }
    res.clearCookie('connect.sid')
    res.status(200).json({ message: 'Logged out successfully' })
    return
  })
})

export default authRouter
