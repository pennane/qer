import { partition } from './lib'
import { CurrentTrack, SpotifyTrack } from './models'
import { addUser } from './stores'
import { getTrack, addTrack } from './tracks'

import dotenv from 'dotenv'

dotenv.config()

const { SPOTIFY_CLIENT_ID, SPOTIFY_SECRET, SPOTIFY_REDIRECT_URI } = process.env

if ([SPOTIFY_CLIENT_ID, SPOTIFY_SECRET, SPOTIFY_REDIRECT_URI].some((x) => !x))
	throw new Error('Missing env variables')

const SPOTIFY_API_URL = 'https://api.spotify.com/v1'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'

const AUTHORIZATION_HEADER = (clientId: string, clientSecret: string) =>
	`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`

const COMMON_HEADERS = {
	'Content-Type': 'application/x-www-form-urlencoded',
}

export function createAuthURL(state: string): string {
	const scope =
		'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: SPOTIFY_CLIENT_ID!,
		redirect_uri: SPOTIFY_REDIRECT_URI!,
		scope,
		state,
	})
	return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`
}

async function fetchTokenOrRefresh(body: URLSearchParams) {
	const response = await fetch(SPOTIFY_TOKEN_URL, {
		method: 'POST',
		headers: {
			...COMMON_HEADERS,
			Authorization: AUTHORIZATION_HEADER(
				SPOTIFY_CLIENT_ID!,
				SPOTIFY_SECRET!,
			),
		},
		body,
	})
	return await response.json()
}

export async function fetchToken(code: string) {
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code,
		redirect_uri: SPOTIFY_REDIRECT_URI!,
	})
	return fetchTokenOrRefresh(body)
}

export async function refreshAccessToken(refreshToken: string) {
	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
	})
	return fetchTokenOrRefresh(body)
}

export async function fetchUserProfile(accessToken: string) {
	const response = await fetch(`${SPOTIFY_API_URL}/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})
	const profile = await response.json()
	addUser({ displayName: profile.display_name, id: profile.id, accessToken })
	return profile
}

export async function fetchCurrentTrack(
	accessToken: string,
): Promise<CurrentTrack | null> {
	const response = await fetch(`${SPOTIFY_API_URL}/me/player`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	if (!response.ok) {
		console.error(
			'Failed to fetch current track:',
			response.status,
			response.statusText,
		)
		return null
	}

	const data = await response.json()
	if (!data.item) return null

	return {
		id: data.item.id,
		name: data.item.name,
		artist: data.item.artists
			.map((artist: { name: string }) => artist.name)
			.join(', '),
		durationMs: data.item.duration_ms,
		progressMs: data.progress_ms,
		isPlaying: data.is_playing,
		uri: data.uri,
	}
}

export async function fetchTracks(
	ids: string[],
	accessToken: string,
): Promise<SpotifyTrack[]> {
	const [, newTracks] = partition((x): x is string => !!getTrack(x), ids)

	const url = `${SPOTIFY_API_URL}/tracks?ids=${newTracks.join(',')}`
	const response = await fetch(url, {
		headers: { Authorization: `Bearer ${accessToken}` },
	})

	const data = await response.json()
	if (!data?.tracks || !Array.isArray(data.tracks))
		throw new Error('Invalid response from Spotify API')

	data.tracks.forEach((track: any) => addTrack(track))

	return ids
		.map((id) => getTrack(id))
		.filter((x: SpotifyTrack | null): x is SpotifyTrack => !!x)
}

export async function playTrack(accessToken: string, trackUri: string) {
	await fetch(`${SPOTIFY_API_URL}/me/player/play`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ uris: [trackUri] }),
	})
}
