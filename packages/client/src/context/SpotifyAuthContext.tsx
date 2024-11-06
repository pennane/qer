import { createContext, useContext, useState, ReactNode, FC } from 'react'
import {
  AuthorizationCodeWithPKCEStrategy,
  SpotifyApi
} from '@spotify/web-api-ts-sdk'

const emptyAccessToken = {
  access_token: 'emptyAccessToken',
  token_type: '',
  expires_in: 0,
  refresh_token: '',
  expires: -1
}

function isEmptyAccessToken(value: unknown): boolean {
  return value === emptyAccessToken
}

type AuthContextType = {
  userType: 'user' | 'admin'
  joinAsQueueUser: () => Promise<void>
  joinAsQueueAdmin: () => Promise<void>
  api: SpotifyApi
  loading: boolean
  error: string | null
}

const SpotifyAuthContext = createContext<AuthContextType | undefined>(undefined)

const performUserAuthorization = async (
  scopes: string[]
): Promise<{ error: string | null; api: SpotifyApi | null }> => {
  const spotifyApi = new SpotifyApi(
    new AuthorizationCodeWithPKCEStrategy(
      import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
      scopes
    )
  )

  const accessToken =
    await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (spotifyApi as any).authenticationStrategy.getOrCreateAccessToken()

  if (
    !accessToken ||
    isEmptyAccessToken(accessToken) ||
    accessToken.expires! < Date.now()
  ) {
    console.log(accessToken)
    return { error: 'invalid access token :((', api: null }
  }
  const serverStatus = await fetch(
    import.meta.env.VITE_SPOTIFY_ACCEPT_TOKEN_URI,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accessToken),
      credentials: 'include'
    }
  ).then((res) => res.status)

  if (serverStatus !== 200) return { error: 'server not happy :((', api: null }

  return { api: spotifyApi, error: null }
}

const USER_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative'
]
const ADMIN_SCOPES = USER_SCOPES.concat([
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
])

export const SpotifyAuthProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const [api, setApi] = useState<SpotifyApi | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)

  const joinAsQueueUser = async () => {
    if (api) return
    setLoading(true)
    await performUserAuthorization(USER_SCOPES)
      .then(({ api, error }) => {
        setApi(api)
        setError(error)
        setUserType('user')
      })
      .finally(() => setLoading(false))
  }

  const joinAsQueueAdmin = async () => {
    if (api) return
    await performUserAuthorization(ADMIN_SCOPES)
      .then(({ api, error }) => {
        setApi(api)
        setError(error)
        setUserType('admin')
      })
      .finally(() => setLoading(false))
  }

  return (
    <SpotifyAuthContext.Provider
      value={{
        userType,
        joinAsQueueUser,
        joinAsQueueAdmin,
        api: api as SpotifyApi,
        error,
        loading
      }}
    >
      {children}
    </SpotifyAuthContext.Provider>
  )
}

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext)
  if (!context)
    throw new Error('useSpotifyAuth must be used within SpotifyAuthProvider')
  return context
}
