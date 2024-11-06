import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SpotifyAuthProvider } from './context/SpotifyAuthContext'
import App from './App'
import { EnsureLogin } from './components/EnsureLogin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/:id',
    element: <App />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SpotifyAuthProvider>
        <EnsureLogin>
          <RouterProvider router={router} />
        </EnsureLogin>
      </SpotifyAuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
