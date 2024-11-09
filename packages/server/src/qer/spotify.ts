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
		console.log(1)
		const token = getToken(req)
		console.log(2, token)
		if (!token) return {}
		console.log(3)
		const api = SpotifyApi.withAccessToken(config.SPOTIFY_CLIENT_ID, token)
		console.log(4, api)
		const accessToken = await api.getAccessToken()
		console.log(5, accessToken)
		if (!accessToken || !accessToken.access_token) return {}
		console.log(6)
		const profile = await api.currentUser.profile()
		console.log(7, profile)
		if (!profile) return {}
		console.log(8)
		apiStore.set(profile.id, api)
		res?.cookie('token', JSON.stringify(accessToken), {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		})

		return { api: api, profile }
	} catch (e) {
		console.log(e)
		return {}
	}
}
