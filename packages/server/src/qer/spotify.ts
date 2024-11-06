import { Request, Response } from 'express'
import config from '../lib/config'
import { SpotifyApi, UserProfile } from '@spotify/web-api-ts-sdk'

function getToken(req: Request) {
	if (req.body.access_token) {
		return req.body
	}
	try {
		const token = JSON.parse(req.cookies.token || '')
		return token
	} catch {
		return null
	}
}

/**
 * YOLO
 */
export const apiStore = new Map<string, SpotifyApi>()

export async function getSpotify(
	req: Request,
	res?: Response,
): Promise<{ api?: SpotifyApi; profile?: UserProfile }> {
	try {
		const token = getToken(req)
		if (!token) return {}
		const api = SpotifyApi.withAccessToken(config.SPOTIFY_CLIENT_ID, token)
		const accessToken = await api.getAccessToken()
		if (!accessToken || !accessToken.access_token) return {}
		const profile = await api.currentUser.profile()
		if (!profile) return {}
		apiStore.set(profile.id, api)
		res?.cookie('token', JSON.stringify(accessToken), {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		})

		return { api: api, profile }
	} catch (e) {
		return {}
	}
}
