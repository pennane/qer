import dotenv from 'dotenv'
dotenv.config()

function requiredVariable<T extends string>(key: T): [T, string] {
	const value = process.env[key]
	if (!value) throw new Error(`${key} missing from env variables`)
	return [key, value]
}

function fromEntries<T extends string>(entries: [T, string][]) {
	return entries.reduce(
		(obj, [key, value]) => Object.assign(obj, { [key]: value }),
		{} as Record<T, string>,
	)
}

const requiredVariables = [
	'SPOTIFY_CLIENT_ID',
	'SPOTIFY_SECRET',
	'CORS_CLIENT_URL',
	'SESSION_SECRET',
	'COOKIE_SECRET',
] as const

export default fromEntries(requiredVariables.map(requiredVariable))
