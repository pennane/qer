import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
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

async function performUserAuthorization(
  clientId: string,
  redirectUri: string,
  scopes: string[],
  onAuthorizationOrUrl: string
) {
  const strategy = new AuthorizationCodeWithPKCEStrategy(
    clientId,
    redirectUri,
    scopes
  )
  const client = new SpotifyApi(strategy)
  const accessToken =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (client as any).authenticationStrategy.getOrCreateAccessToken()

  if (accessToken && !isEmptyAccessToken(accessToken)) {
    await fetch(onAuthorizationOrUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accessToken),
      credentials: 'include'
    })
  }

  return {
    authenticated:
      accessToken.expires! > Date.now() && !isEmptyAccessToken(accessToken),
    accessToken
  }
}

performUserAuthorization(
  import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing'.split(
    ' '
  ),
  import.meta.env.VITE_SPOTIFY_ACCEPT_TOKEN_URI
)
  .then(console.log)
  .catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
