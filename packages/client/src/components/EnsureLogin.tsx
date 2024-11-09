import { FC, ReactNode } from 'react'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'
import { Button } from './Button'
import { ErrorText, LoadingText } from './Misc'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchQueue } from '../api'

export const EnsureLogin: FC<{ children: ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['queue', id],
    queryFn: () => fetchQueue(id!),
    retry: false,
    enabled: !!id,
    throwOnError: false
  })

  const {
    api,
    loading,
    joinAsQueueAdmin,
    joinAsQueueUser,
    error: authError
  } = useSpotifyAuth()

  if (authError) {
    return <ErrorText>Auth failed: {authError.message}</ErrorText>
  }

  if (loading || isLoading) {
    return <LoadingText>... loading :D</LoadingText>
  }

  if (!id) {
    return (
      <Button disabled={loading} onClick={joinAsQueueAdmin}>
        Join to create a queue
      </Button>
    )
  }

  if (data && api) {
    return <>{children}</>
  }

  if (data && !api) {
    return (
      <Button disabled={loading} onClick={joinAsQueueUser}>
        Join existing queue
      </Button>
    )
  }

  return (
    <Button disabled={loading} onClick={joinAsQueueAdmin}>
      Join to create a queue
    </Button>
  )
}
