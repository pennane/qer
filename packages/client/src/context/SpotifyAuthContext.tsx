import { createContext, useContext, useState, ReactNode, FC } from 'react'
import {
  AuthorizationCodeWithPKCEStrategy,
  SpotifyApi,
  UserProfile
} from '@spotify/web-api-ts-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCreateQueue, fetchProfile } from '../api'
import { useNavigate } from 'react-router-dom'

export const TARGET_QUEUE_KEY = 'target-queue-id'

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
  profile: UserProfile
  joinAsQueueUser: () => Promise<void>
  joinAsQueueAdmin: () => Promise<void>
  api: SpotifyApi
  loading: boolean
  error: Error
}

const SpotifyAuthContext = createContext<AuthContextType | undefined>(undefined)

const performUserAuthorization = async (
  scopes: string[]
): Promise<{ error: string | null; api: SpotifyApi | null }> => {
  const targetId = new URLSearchParams(window.location.search).get('id')
  if (targetId) {
    sessionStorage.setItem(TARGET_QUEUE_KEY, targetId)
  }

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
    return { error: null, api: null }
  }
  try {
    const serverStatus = await fetch(
      import.meta.env.VITE_SPOTIFY_ACCEPT_TOKEN_URI,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accessToken),
        credentials: 'include'
      }
    ).then((res) => res.status)
    if (serverStatus !== 200)
      return { error: 'server not happy :((', api: null }
    sessionStorage.removeItem(TARGET_QUEUE_KEY)

    return { api: spotifyApi, error: null }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { api: null, error: ((e as any) || {}).message }
  }
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
  const queryClient = useQueryClient()
  const [api, setApi] = useState<SpotifyApi | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [userType, setUserType] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { data: profile, error: profileError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => fetchProfile(api!),
    enabled: !!api,
    throwOnError: false
  })

  const { mutateAsync: createQueueMutation, error: createQueueError } =
    useMutation({
      mutationFn: fetchCreateQueue,
      onSuccess: (data) => {
        queryClient.setQueryData(['queue', data.userId], data)
        navigate(`/${data.userId}`, { replace: true })
      },
      onError: console.log,
      throwOnError: false
    })

  const joinAsQueueUser = async () => {
    setLoading(true)
    await performUserAuthorization(USER_SCOPES)
      .then(({ api, error }) => {
        setApi(api)
        setError(error ? new Error(error) : null)
        setUserType('user')
      })
      .finally(() => setLoading(false))
  }

  const joinAsQueueAdmin = async () => {
    await performUserAuthorization(ADMIN_SCOPES)
      .then(({ api, error }) => {
        setApi(api)
        setError(error ? new Error(error) : null)
        setUserType('admin')
      })
      .then(() => createQueueMutation([]))
      .then((queue) => {
        setLoading(false)
        navigate(`/${queue.userId}`, { replace: true })
      })
      .catch(() => setLoading(false))
  }

  return (
    <SpotifyAuthContext.Provider
      value={{
        userType,
        joinAsQueueUser,
        joinAsQueueAdmin,
        profile: profile!,
        api: api!,
        error: error || profileError || createQueueError,
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
