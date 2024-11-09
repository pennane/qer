import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SpotifyAuthProvider } from './context/SpotifyAuthContext'
import App from './App'
import { EnsureLogin } from './components/EnsureLogin'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { BackgroundLines } from './components/BackgroundLines'

const queryClient = new QueryClient()

const Main = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundLines />
      <SpotifyAuthProvider>
        <EnsureLogin>
          <Outlet />
        </EnsureLogin>
      </SpotifyAuthProvider>
    </QueryClientProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <Main />,
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: '/:id',
        element: <App />
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
